import { PrismaClient, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // USERS
  const user = await prisma.user.create({
    data: {
      username: 'rifkydev',
      email: 'rifky@mail.com',
      password: 'hashed_password_dummy', // dummy
      phoneNumber: '08123456789',
      role: 'admin',
      refreshToken: 'dummy_refresh_token_123',
    },
  });

  // LIST GAMES
  const mlGame = await prisma.listGame.create({
    data: {
      gameName: 'Mobile Legends',
      slug: 'mobile-legends',
      urlGamesImage: 'https://cdn.example.com/ml-icon.png',
      urlGameBanner: 'https://cdn.example.com/ml-banner.png',
      status: true,
      category: 'MOBA',
      listPackets: {
        create: [
          { name: '86 Diamonds', price: 20000 },
          { name: '172 Diamonds', price: 39000 },
          { name: '344 Diamonds', price: 76000 },
        ],
      },
    },
  });

  const ffGame = await prisma.listGame.create({
    data: {
      gameName: 'Free Fire',
      slug: 'free-fire',
      urlGamesImage: 'https://cdn.example.com/ff-icon.png',
      urlGameBanner: 'https://cdn.example.com/ff-banner.png',
      status: true,
      category: 'BATTLE_ROYALE',
      listPackets: {
        create: [
          { name: '140 Diamonds', price: 20000 },
          { name: '355 Diamonds', price: 50000 },
          { name: '720 Diamonds', price: 100000 },
        ],
      },
    },
  });

  // BANNERS
  await prisma.banner.createMany({
    data: [
      { name: 'Promo ML', imageUrl: 'https://cdn.example.com/banner-ml.png' },
      { name: 'Promo FF', imageUrl: 'https://cdn.example.com/banner-ff.png' },
      {
        name: 'Special Offer',
        imageUrl: 'https://cdn.example.com/banner-special.png',
      },
    ],
  });

  // PRODUCT DIGIFLAZZ
  await prisma.productDigiflazz.createMany({
    data: [
      {
        buyerSkuCode: 'ML86',
        productName: 'Mobile Legends 86 Diamonds',
        category: 'Game',
        brand: 'Mobile Legends',
        type: 'Diamond',
        sellerName: 'Digiflazz',
        price: 20000,
        stock: 999,
        buyerProductStatus: true,
        sellerProductStatus: true,
        desc: 'Top up Mobile Legends 86 Diamonds for your account',
      },
      {
        buyerSkuCode: 'ML172',
        productName: 'Mobile Legends 172 Diamonds',
        category: 'Game',
        brand: 'Mobile Legends',
        type: 'Diamond',
        sellerName: 'Digiflazz',
        price: 39000,
        stock: 888,
        buyerProductStatus: true,
        sellerProductStatus: true,
        desc: 'Top up Mobile Legends 172 Diamonds for your account',
      },
      {
        buyerSkuCode: 'FF140',
        productName: 'Free Fire 140 Diamonds',
        category: 'Game',
        brand: 'Free Fire',
        type: 'Diamond',
        sellerName: 'Digiflazz',
        price: 20000,
        stock: 999,
        buyerProductStatus: true,
        sellerProductStatus: true,
        desc: 'Top up Free Fire 140 Diamonds for your account',
      },
    ],
  });

  // TRANSACTIONS
  await prisma.transaction.createMany({
    data: [
      {
        orderId: 'ORDER-001',
        amount: 20000,
        status: TransactionStatus.PENDING,
        paymentMethod: 'QRIS',
        sku: 'ML86',
        customerNo: '08123456789',
        userId: user.id,
      },
      {
        orderId: 'ORDER-002',
        amount: 39000,
        status: TransactionStatus.SETTLEMENT,
        paymentMethod: 'OVO',
        sku: 'ML172',
        customerNo: '08123456789',
        userId: user.id,
      },
      {
        orderId: 'ORDER-003',
        amount: 50000,
        status: TransactionStatus.CANCEL,
        paymentMethod: 'DANA',
        sku: 'FF355',
        customerNo: '08198765432',
        userId: user.id,
      },
      {
        orderId: 'ORDER-004',
        amount: 100000,
        status: TransactionStatus.EXPIRE,
        paymentMethod: 'Bank Transfer',
        sku: 'FF720',
        customerNo: '08198765432',
        userId: user.id,
      },
    ],
  });

  console.log('✅ Seed data lengkap berhasil dibuat');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
