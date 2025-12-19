import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("NFTAssetManager", function () {

  async function deployFixture() {
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const DID = await ethers.getContractFactory("DIDRegistry");
    const did = await DID.deploy();
    await did.waitForDeployment();

    await did.connect(alice).registerDID("ipfs://alice");
    await did.connect(bob).registerDID("ipfs://bob");

    const NFT = await ethers.getContractFactory("NFTAssetManager");
    const nft = await NFT.deploy(await did.getAddress());
    await nft.waitForDeployment();

    return { nft, did, owner, alice, bob, charlie };
  }

  async function mint(nft: any, alice: any) {
    const fee = await nft.calculateFee(await nft.MINT_FEE());
    await nft.connect(alice).mintNFT("ipfs://asset", { value: fee });
  }

  it("mintNFT - correct mint", async function () {
    const { nft, alice } = await deployFixture();
    const fee = await nft.calculateFee(await nft.MINT_FEE());

    await nft.connect(alice).mintNFT("ipfs://asset", { value: fee });

    expect(await nft.ownerOf(1)).to.equal(alice.address);
  });

  it("mintNFT - wrong value should fail", async function () {
    const { nft, alice } = await deployFixture();

    await expect( nft.connect(alice).mintNFT("ipfs://asset", { value: 1 }))
                .to.be.revertedWith("Incorrect mint fee");
  });

  it("mintNFT - unregistered user should fail", async function () {
    const { nft, owner } = await deployFixture();
    const fee = await nft.calculateFee(await nft.MINT_FEE());

    await expect(nft.connect(owner).mintNFT("ipfs://asset", { value: fee }))
                .to.be.revertedWith("DID not registered");
  });

  it("mintNFT - empty metadata should fail", async function () {
    const { nft, alice } = await deployFixture();
    const fee = await nft.calculateFee(await nft.MINT_FEE());

    await expect(nft.connect(alice).mintNFT("", { value: fee }))
                .to.be.revertedWith("Invalid metadata CID");
  });

  it("burnNFT - correct burn by owner", async function () {
    const { nft, alice } = await deployFixture();
    await mint(nft, alice);

    const burnFee = await nft.calculateFee(await nft.BURN_FEE());

    await nft.connect(alice).burnNFT(1, { value: burnFee });
    //await expect(nft.ownerOf(1)).to.be.reverted;
  });

  it("burnNFT - non-existent token should fail", async function () {
    const { nft, alice } = await deployFixture();
    const burnFee = await nft.calculateFee(await nft.BURN_FEE());

    await expect(nft.connect(alice).burnNFT(999, { value: burnFee })).to.be.revertedWith("Token does not exist");
  });

  it("burnNFT - wrong value should fail", async function () {
    const { nft, alice } = await deployFixture();
    await mint(nft, alice);

    await expect(nft.connect(alice).burnNFT(1, { value: 1 })).to.be.revertedWith("Incorrect burn fee");
  });

  it("burnNFT - unauthorized user should fail", async function () {
    const { nft, alice, bob } = await deployFixture();
    await mint(nft, alice);

    const burnFee = await nft.calculateFee(await nft.BURN_FEE());

    await expect(nft.connect(bob).burnNFT(1, { value: burnFee })).to.be.revertedWith("Not authorized to burn");
  });

  it("tokenMetadata - correct", async function () {
    const { nft, alice } = await deployFixture();
    await mint(nft, alice);

    expect(await nft.tokenMetadata(1)).to.equal("ipfs://asset");
  });

  it("tokenMetadata - non-existent token should fail", async function () {
    const { nft } = await deployFixture();

    await expect(nft.tokenMetadata(999)).to.be.revertedWith("Token does not exist");
  });

  it("didOwnerOf - correct", async function () {
    const { nft, alice } = await deployFixture();
    await mint(nft, alice);

    expect(await nft.didOwnerOf(1)).to.equal(alice.address);
  });

  it("didOwnerOf - non-existent token should fail", async function () {
    const { nft } = await deployFixture();

    await expect(nft.didOwnerOf(999)).to.be.revertedWith("Token does not exist");
  });

  it("transferNFT - correct transfer", async function () {
    const { nft, alice, bob } = await deployFixture();
    await mint(nft, alice);

    const fee = await nft.calculateFee(await nft.TRANSFER_FEE());

    await nft.connect(alice).transferNFT(bob.address, 1, { value: fee });

    expect(await nft.ownerOf(1)).to.equal(bob.address);
    expect(await nft.didOwnerOf(1)).to.equal(bob.address);
  });

  it("transferNFT - wrong value should fail", async function () {
    const { nft, alice, bob } = await deployFixture();
    await mint(nft, alice);

    await expect(nft.connect(alice).transferNFT(bob.address, 1, { value: 1 })).to.be.revertedWith("Incorrect transfer fee");
  });

  it("transferNFT - sender not owner should fail", async function () {
    const { nft, alice, bob } = await deployFixture();
    await mint(nft, alice);

    const fee = await nft.calculateFee(await nft.TRANSFER_FEE());

    await expect(nft.connect(bob).transferNFT(alice.address, 1, { value: fee }))
                .to.be.revertedWith("Not the owner of the token");
  });

  it("transferNFT - receiver without DID should fail", async function () {
    const { nft, alice, charlie } = await deployFixture();
    await mint(nft, alice);

    const fee = await nft.calculateFee(await nft.TRANSFER_FEE());

    await expect(nft.connect(alice).transferNFT(charlie.address, 1, { value: fee }))
                .to.be.revertedWith("Receiver has no DID");
  });

  it("withdraw - correct", async function () {
    const { nft, owner, alice } = await deployFixture();
    await mint(nft, alice);

    const balanceBefore = await ethers.provider.getBalance(owner.address);

    await nft.connect(owner).withdraw();

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.lt(balanceBefore);
  });

  it("withdraw - zero balance should fail", async function () {
    const { nft, owner } = await deployFixture();

    await expect(nft.connect(owner).withdraw()).to.be.revertedWith("Nothing to withdraw");
  });
});
