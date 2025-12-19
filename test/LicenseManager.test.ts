import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("LicenseManager", function () {

  async function deployFixture() {
    const [alice, bob, charlie] = await ethers.getSigners();

    const DID = await ethers.getContractFactory("DIDRegistry");
    const did = await DID.deploy();
    await did.waitForDeployment();

    await did.connect(alice).registerDID("ipfs://alice");
    await did.connect(bob).registerDID("ipfs://bob");

    const License = await ethers.getContractFactory("LicenseManager");
    const license = await License.deploy(await did.getAddress());
    await license.waitForDeployment();

    return { license, did, alice, bob, charlie };
  }

  async function createValidLicense(license: any, alice: any, bob: any) {
    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + 1000;

    await license.connect(alice).createLicense(bob.address, expiry, "ipfs://license");
  }

  it("createLicense - correct", async function () {
    const { license, alice, bob } = await deployFixture();

    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + 1000;

    await license.connect(alice).createLicense(bob.address, expiry, "ipfs://license");

    expect(await license.checkValidLicense(1)).to.equal(true);
  });

  it("createLicense - caller must have DID", async function () {
    const { license, bob, charlie } = await deployFixture();
    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + 1000;

    await expect(license.connect(charlie).createLicense(bob.address, expiry, "ipfs://license"))
                .to.be.revertedWith("DID not registered");
  });

  it("createLicense - expiry must be in the future", async function () {
    const { license, alice, bob } = await deployFixture();
    const pastExpiry = (await ethers.provider.getBlock("latest"))!.timestamp - 1;

    await expect(license.connect(alice).createLicense(bob.address, pastExpiry, "ipfs://license"))
                .to.be.revertedWith("Expiry must be in the future");
  });

  it("createLicense - empty document CID should fail", async function () {
    const { license, alice, bob } = await deployFixture();
    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + 1000;

    await expect(license.connect(alice).createLicense(bob.address, expiry, ""))
                .to.be.revertedWith("Invalid document CID");
  });

  it("revokeLicense - correct", async function () {
    const { license, alice, bob } = await deployFixture();
    await createValidLicense(license, alice, bob);

    await license.connect(bob).revokeLicense(1);

    expect(await license.checkValidLicense(1)).to.equal(false);
  });

  it("revokeLicense - only license owner can revoke", async function () {
    const { license, alice, bob } = await deployFixture();
    await createValidLicense(license, alice, bob);

    await expect(license.connect(alice).revokeLicense(1)).to.be.revertedWith("Not the license owner");
  });

  it("revokeLicense - already revoked license should fail", async function () {
    const { license, alice, bob } = await deployFixture();
    await createValidLicense(license, alice, bob);

    await license.connect(bob).revokeLicense(1);

    await expect(license.connect(bob).revokeLicense(1)).to.be.revertedWith("License already revoked");
  });

  it("checkValidLicense - valid license returns true", async function () {
    const { license, alice, bob } = await deployFixture();
    await createValidLicense(license, alice, bob);

    expect(await license.checkValidLicense(1)).to.equal(true);
  });

  it("checkValidLicense - expired license returns false", async function () {
    const { license, alice, bob } = await deployFixture();
    const expiry = (await ethers.provider.getBlock("latest"))!.timestamp + 100;

    await license.connect(alice).createLicense(bob.address,expiry,"ipfs://license");

    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    expect(await license.checkValidLicense(1)).to.equal(false);
  });

  it("getLicense - correct", async function () {
    const { license, alice, bob } = await deployFixture();
    await createValidLicense(license, alice, bob);

    const [owner, expiry, cid, revoked] = await license.getLicense(1);

    expect(owner).to.equal(bob.address);
    expect(cid).to.equal("ipfs://license");
    expect(revoked).to.equal(false);
    expect(expiry).to.be.gt(0);
  });

  it("getLicense - non-existent license should fail", async function () {
    const { license } = await deployFixture();

    await expect(license.getLicense(999)).to.be.revertedWith("License does not exist");
  });
});
