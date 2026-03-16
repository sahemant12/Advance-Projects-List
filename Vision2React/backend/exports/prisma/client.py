from prisma import Prisma

prisma = Prisma()


async def connect_db():
    await prisma.connect()
    print("Database connected..")


async def disconnect_db():
    await prisma.disconnect()
    print("Database disconnected")
