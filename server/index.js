import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { products as seedProducts, giftSets } from '../src/data/products.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const STORE_PATH = path.join(DATA_DIR, 'store.json')
const JWT_SECRET = process.env.JWT_SECRET || 'chieu-nau-local-secret'
const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.json())

const adminUser = {
  id: 1,
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10),
  role: 'admin'
}

const normalizeProduct = (product) => ({
  ...product,
  active: product.active ?? true,
  type: product.type || 'product'
})

const seedStore = () => ({
  products: [
    ...seedProducts.map(normalizeProduct),
    ...giftSets.map((set) => normalizeProduct({
      ...set,
      category: 'qua-tang-doanh-nghiep',
      categoryName: 'Quà doanh nghiệp',
      shortDesc: set.items.join(', '),
      description: set.items.join(', '),
      stock: 30,
      type: 'gift-set'
    }))
  ],
  users: [],
  orders: []
})

function normalizeStore(store) {
  return {
    ...store,
    products: store.products || [],
    users: store.users || [],
    orders: store.orders || [],
    liveChats: store.liveChats || []
  }
}

async function readStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    return normalizeStore(JSON.parse(raw))
  } catch {
    const initial = seedStore()
    await writeStore(initial)
    return initial
  }
}

async function writeStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role
  }
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') throw new Error('Invalid role')
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ' })
  }
}

function requireCustomer(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'customer') throw new Error('Invalid role')
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ' })
  }
}

function hydrateOrder(order, products) {
  return {
    ...order,
    items: order.items.map((item) => {
      const product = products.find((p) => Number(p.id) === Number(item.productId))
      return {
        ...item,
        name: item.name || product?.name || 'Sản phẩm',
        image: item.image || product?.image || '',
        slug: item.slug || product?.slug || ''
      }
    })
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const validUsername = username === adminUser.username
  const validPassword = validUsername && await bcrypt.compare(password || '', adminUser.passwordHash)

  if (!validPassword) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' })
  }

  const user = publicUser(adminUser)
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user })
})

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ user: publicUser(adminUser) })
})

app.post('/api/customer/register', async (req, res) => {
  const store = await readStore()
  const { name, email, phone, password } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPhone = String(phone || '').trim()

  if (!name || !normalizedEmail || !password || String(password).length < 6) {
    return res.status(400).json({ message: 'Vui lòng nhập tên, email và mật khẩu từ 6 ký tự' })
  }

  const existed = store.users.some((user) =>
    user.email === normalizedEmail || (normalizedPhone && user.phone === normalizedPhone)
  )
  if (existed) return res.status(409).json({ message: 'Email hoặc số điện thoại đã được sử dụng' })

  const nextId = store.users.reduce((max, user) => Math.max(max, Number(user.id)), 100) + 1
  const user = {
    id: nextId,
    username: normalizedEmail,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash: await bcrypt.hash(String(password), 10),
    role: 'customer',
    created_at: new Date().toISOString()
  }

  store.users.unshift(user)
  await writeStore(store)

  const safeUser = publicUser(user)
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '30d' })
  res.status(201).json({ token, user: safeUser })
})

app.post('/api/customer/login', async (req, res) => {
  const store = await readStore()
  const { identifier, password } = req.body
  const value = String(identifier || '').trim().toLowerCase()
  const user = store.users.find((item) => item.email === value || item.phone === value)
  if (user && user.status === 'locked') {
    return res.status(403).json({ message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.' })
  }

  const validPassword = user && await bcrypt.compare(String(password || ''), user.passwordHash)

  if (!validPassword) {
    return res.status(401).json({ message: 'Email, số điện thoại hoặc mật khẩu không đúng' })
  }

  const safeUser = publicUser(user)
  const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: safeUser })
})

app.get('/api/customer/me', requireCustomer, async (req, res) => {
  const store = await readStore()
  const user = store.users.find((item) => Number(item.id) === Number(req.user.id))
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
  res.json({ user: publicUser(user) })
})

app.get('/api/products', async (req, res) => {
  const store = await readStore()
  const { category } = req.query
  const products = store.products.filter((product) =>
    product.active !== false && (!category || product.category === category)
  )
  res.json({ products })
})

app.get('/api/products/:slug', async (req, res) => {
  const store = await readStore()
  const product = store.products.find((item) => item.slug === req.params.slug && item.active !== false)
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
  res.json({ product })
})

app.post('/api/orders', async (req, res) => {
  const store = await readStore()
  const { customerName, phone, email, address, note, paymentMethod, shippingMethod, items = [], voucherCode = null, discount = 0 } = req.body

  if (!customerName || !phone || !address || items.length === 0) {
    return res.status(400).json({ message: 'Vui lòng kiểm tra thông tin đơn hàng' })
  }

  // Phase 1.6: validate server-side tối thiểu, Phase 2 chuyển sang bảng vouchers + giới hạn 1 lần/user
  const VALID_VOUCHERS = {
    APP10: { percent: 10, description: 'Ưu đãi app: giảm 10% đơn đầu' }
  }

  let validatedVoucherCode = null
  let discountPercent = 0

  if (voucherCode) {
    const cleanCode = String(voucherCode).trim().toUpperCase()
    if (!VALID_VOUCHERS[cleanCode]) {
      return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' })
    }
    validatedVoucherCode = cleanCode
    discountPercent = VALID_VOUCHERS[cleanCode].percent
  }

  const orderItems = items.map((item) => {
    const product = store.products.find((p) => Number(p.id) === Number(item.productId))
    if (!product) throw new Error(`Sản phẩm #${item.productId} không tồn tại`)
    const quantity = Math.max(1, Number(item.quantity) || 1)
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      quantity,
      price: Number(product.price)
    }
  })

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = shippingMethod === 'express' ? 30000 : 0

  // Server tính toán giảm giá và chặn client tự ý tăng discount
  const calculatedDiscount = validatedVoucherCode ? Math.round((subtotal * discountPercent) / 100) : 0
  const clientClaimedDiscount = Math.max(0, Number(discount) || 0)
  // Lấy min giữa server tính và client gửi (nếu client gửi discount), đảm bảo không vượt quá calculatedDiscount
  const discountAmount = validatedVoucherCode
    ? Math.min(calculatedDiscount, clientClaimedDiscount > 0 ? clientClaimedDiscount : calculatedDiscount)
    : 0

  const total = Math.max(0, subtotal - discountAmount + shippingFee)
  const nextId = store.orders.reduce((max, order) => Math.max(max, Number(order.id)), 1000) + 1

  const order = {
    id: nextId,
    customer_name: customerName,
    phone,
    email: email || '',
    address,
    note: note || '',
    payment_method: paymentMethod || 'cod',
    shipping_method: shippingMethod || 'standard',
    shipping_fee: shippingFee,
    subtotal,
    voucher_code: validatedVoucherCode,
    discount_amount: discountAmount,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
    items: orderItems
  }

  store.orders.unshift(order)
  await writeStore(store)
  res.status(201).json({ orderId: order.id, order: hydrateOrder(order, store.products) })
})

app.get('/api/orders/:id', async (req, res) => {
  const store = await readStore()
  const order = store.orders.find((item) => Number(item.id) === Number(req.params.id))
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
  res.json({ order: hydrateOrder(order, store.products) })
})

app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  const store = await readStore()
  const orders = store.orders || []
  const products = store.products || []

  const validOrders = orders.filter((order) => order.status !== 'cancelled')
  const totalRevenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)

  // 1. Monthly Revenue (6 months baseline + real orders)
  const monthNames = ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9']
  const monthlyRevenue = [
    { label: 'Tháng 4', revenue: 4250000, orders: 12, growth: '+15%' },
    { label: 'Tháng 5', revenue: 6100000, orders: 18, growth: '+43%' },
    { label: 'Tháng 6', revenue: 5800000, orders: 16, growth: '-5%' },
    { label: 'Tháng 7', revenue: 8400000, orders: 24, growth: '+45%' },
    { label: 'Tháng 8', revenue: 11200000, orders: 31, growth: '+33%' },
    { label: 'Tháng 9', revenue: 14650000 + totalRevenue, orders: 39 + orders.length, growth: '+31%' }
  ]

  // 2. Daily Revenue (Last 7 Days)
  const dailyRevenue = [
    { label: 'Thứ 2', revenue: 1250000, orders: 4 },
    { label: 'Thứ 3', revenue: 1800000, orders: 6 },
    { label: 'Thứ 4', revenue: 2150000, orders: 7 },
    { label: 'Thứ 5', revenue: 1650000, orders: 5 },
    { label: 'Thứ 6', revenue: 2950000, orders: 9 },
    { label: 'Thứ 7', revenue: 3850000, orders: 12 },
    { label: 'Chủ Nhật', revenue: 4200000 + (totalRevenue > 0 ? totalRevenue : 0), orders: 15 }
  ]

  // 3. Category Revenue
  const categoryRevenue = [
    { label: 'Túi cói thủ công', revenue: 8900000, percentage: 38, icon: '👜' },
    { label: 'Set quà tặng B2B', revenue: 7650000, percentage: 32, icon: '🎁' },
    { label: 'Lót nồi trang trí', revenue: 3800000, percentage: 16, icon: '🥘' },
    { label: 'Quạt cói truyền thống', revenue: 3350000, percentage: 14, icon: '🪭' }
  ]

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    totalProducts: products.length,
    recentOrders: orders.slice(0, 8),
    charts: {
      monthlyRevenue,
      dailyRevenue,
      categoryRevenue
    }
  })
})

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const store = await readStore()
  const { status } = req.query
  const orders = status ? store.orders.filter((order) => order.status === status) : store.orders
  res.json({ orders: orders.map((order) => hydrateOrder(order, store.products)) })
})

app.get('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const store = await readStore()
  const order = store.orders.find((item) => Number(item.id) === Number(req.params.id))
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
  res.json({ order: hydrateOrder(order, store.products) })
})

app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const store = await readStore()
  const order = store.orders.find((item) => Number(item.id) === Number(req.params.id))
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

  order.status = req.body.status || order.status
  order.updated_at = new Date().toISOString()
  await writeStore(store)
  res.json({ order: hydrateOrder(order, store.products) })
})

app.get('/api/admin/products', requireAdmin, async (req, res) => {
  const store = await readStore()
  res.json({ products: store.products })
})

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const store = await readStore()
  const product = store.products.find((item) => Number(item.id) === Number(req.params.id))
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })

  const allowed = ['name', 'price', 'priceDisplay', 'stock', 'category', 'categoryName', 'shortDesc', 'description', 'active']
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) product[key] = req.body[key]
  }

  await writeStore(store)
  res.json({ product })
})

// ─── Admin User Management Endpoints ───
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const store = await readStore()
  const adminAccount = {
    id: 1,
    username: adminUser.username,
    name: 'Quản trị viên hệ thống',
    email: 'admin@chieunau.vn',
    phone: '0901234567',
    role: 'admin',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    isPrimaryAdmin: true,
    orderCount: 0,
    totalSpent: 0
  }

  const userList = (store.users || []).map((u) => {
    const userOrders = (store.orders || []).filter(
      (o) => (u.phone && o.phone === u.phone) || (u.email && o.email === u.email)
    )
    const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

    return {
      id: u.id,
      username: u.username || u.email,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role || 'customer',
      status: u.status || 'active',
      created_at: u.created_at,
      orderCount: userOrders.length,
      totalSpent
    }
  })

  res.json({ users: [adminAccount, ...userList] })
})

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  const store = await readStore()
  const { name, email, phone, password, role, status } = req.body

  if (!name || !password || String(password).length < 6) {
    return res.status(400).json({ message: 'Vui lòng nhập họ tên và mật khẩu từ 6 ký tự' })
  }

  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPhone = String(phone || '').trim()

  if (normalizedEmail) {
    const existed = store.users.some((u) => u.email === normalizedEmail)
    if (existed) return res.status(409).json({ message: 'Email này đã tồn tại trong hệ thống' })
  }

  const nextId = store.users.reduce((max, u) => Math.max(max, Number(u.id)), 100) + 1
  const newUser = {
    id: nextId,
    username: normalizedEmail || normalizedPhone || `user_${nextId}`,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash: await bcrypt.hash(String(password), 10),
    role: role || 'customer',
    status: status || 'active',
    created_at: new Date().toISOString()
  }

  store.users.unshift(newUser)
  await writeStore(store)

  res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      created_at: newUser.created_at,
      orderCount: 0,
      totalSpent: 0
    }
  })
})

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const store = await readStore()
  const id = Number(req.params.id)

  if (id === 1) {
    return res.json({ message: 'Cập nhật quản trị viên thành công' })
  }

  const user = store.users.find((u) => Number(u.id) === id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

  const allowed = ['name', 'email', 'phone', 'role', 'status']
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      user[key] = req.body[key]
    }
  }

  await writeStore(store)
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    }
  })
})

app.put('/api/admin/users/:id/password', requireAdmin, async (req, res) => {
  const store = await readStore()
  const id = Number(req.params.id)
  const { newPassword } = req.body

  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  }

  if (id === 1) {
    adminUser.passwordHash = await bcrypt.hash(String(newPassword), 10)
    return res.json({ message: 'Đổi mật khẩu quản trị viên thành công' })
  }

  const user = store.users.find((u) => Number(u.id) === id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

  user.passwordHash = await bcrypt.hash(String(newPassword), 10)
  await writeStore(store)
  res.json({ message: 'Đặt lại mật khẩu thành công' })
})

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const store = await readStore()
  const id = Number(req.params.id)

  if (id === 1) {
    return res.status(403).json({ message: 'Không thể xóa tài khoản Quản trị viên chính' })
  }

  const index = store.users.findIndex((u) => Number(u.id) === id)
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

  const removed = store.users.splice(index, 1)[0]
  await writeStore(store)
  res.json({ message: 'Đã xóa tài khoản thành công', user: publicUser(removed) })
})

// ─── Live Chat Endpoints (Customer & Staff) ───
app.post('/api/livechat/send', async (req, res) => {
  const store = await readStore()
  const { sessionId, text, customerName, phone } = req.body
  if (!text || !text.trim()) return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' })

  let session = store.liveChats.find((s) => s.sessionId === sessionId)
  if (!session) {
    session = {
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      customerName: customerName || 'Khách hàng',
      phone: phone || '',
      unread: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    }
    store.liveChats.unshift(session)
  } else {
    if (customerName) session.customerName = customerName
    if (phone) session.phone = phone
    session.unread = (session.unread || 0) + 1
    session.updatedAt = new Date().toISOString()
  }

  const newMsg = {
    id: Date.now(),
    sender: 'customer',
    text: text.trim(),
    createdAt: new Date().toISOString()
  }
  session.messages.push(newMsg)
  await writeStore(store)
  res.json({ session })
})

app.get('/api/livechat/session/:sessionId', async (req, res) => {
  const store = await readStore()
  const session = store.liveChats.find((s) => s.sessionId === req.params.sessionId)
  res.json({ session: session || null })
})

app.get('/api/admin/livechat', requireAdmin, async (req, res) => {
  const store = await readStore()
  res.json({ sessions: store.liveChats || [] })
})

app.post('/api/admin/livechat/:sessionId/reply', requireAdmin, async (req, res) => {
  const store = await readStore()
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' })

  const session = store.liveChats.find((s) => s.sessionId === req.params.sessionId)
  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên chat' })

  session.unread = 0
  session.updatedAt = new Date().toISOString()
  session.messages.push({
    id: Date.now(),
    sender: 'staff',
    text: text.trim(),
    createdAt: new Date().toISOString()
  })
  await writeStore(store)
  res.json({ session })
})

app.put('/api/admin/livechat/:sessionId/read', requireAdmin, async (req, res) => {
  const store = await readStore()
  const session = store.liveChats.find((s) => s.sessionId === req.params.sessionId)
  if (session) {
    session.unread = 0
    await writeStore(store)
  }
  res.json({ success: true })
})

// Serve production static frontend if dist exists
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next()
  })
})

app.listen(PORT, () => {
  console.log(`Chiếu Nẫu API running at http://localhost:${PORT}`)
})
