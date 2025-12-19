import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("DIDRegistry", function () {

  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const DID = await ethers.getContractFactory("DIDRegistry");
    const did = await DID.deploy();
    await did.waitForDeployment();
    return { did, owner, alice, bob };
  }

  it("registerDID - should register a valid DID", async function () {
    const { did, alice } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    expect(await did.hasDID(alice.address)).to.equal(true);
    expect(await did.getDID(alice.address)).to.equal("ipfs://aliceDID");
  });

  it("registerDID - empty document should fail", async function () {
    const { did, alice } = await deployFixture();

    await expect(did.connect(alice).registerDID("")).to.be.revertedWith("Invalid DID document");
  });

  it("registerDID - registering twice should fail", async function () {
    const { did, alice } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    await expect(did.connect(alice).registerDID("ipfs://aliceDID-v2")).to.be.revertedWith("DID already registered");
  });

  it("updateDID - owner can update own DID", async function () {
    const { did, alice } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(alice).updateDID("ipfs://aliceDID-updated");

    expect(await did.getDID(alice.address)).to.equal("ipfs://aliceDID-updated");
  });

  it("updateDID - non-owner cannot update someone else's DID", async function () {
    const { did, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    await expect(did.connect(bob).updateDID("ipfs://hackedDID")).to.be.revertedWith("DID not registered");
  });

  it("getDID - should return DID for existing owner", async function () {
    const { did, alice } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    const storedDID = await did.getDID(alice.address);
    expect(storedDID).to.equal("ipfs://aliceDID");
  });

  it("getDID - should fail for non-existing owner", async function () {
    const { did, bob } = await deployFixture();

    await expect(did.getDID(bob.address)).to.be.revertedWith("DID not registered");
  });

  it("hasDID - should correctly report DID existence", async function () {
    const { did, alice, bob } = await deployFixture();

    expect(await did.hasDID(alice.address)).to.equal(false);

    await did.connect(alice).registerDID("ipfs://aliceDID");

    expect(await did.hasDID(alice.address)).to.equal(true);
    expect(await did.hasDID(bob.address)).to.equal(false);
  });
});
