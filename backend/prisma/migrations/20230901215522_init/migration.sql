-- CreateTable
CREATE TABLE "Host" (
    "id" SERIAL NOT NULL,
    "rhpAddress" VARCHAR(255) NOT NULL,
    "rhpPubkey" TEXT NOT NULL,
    "extramonPubkey" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UptimeEntry" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ping" BOOLEAN NOT NULL,
    "rhpv2" BOOLEAN NOT NULL,
    "rhpv3" BOOLEAN NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "UptimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UptimeEntry" ADD CONSTRAINT "UptimeEntry_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
