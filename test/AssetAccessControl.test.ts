import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AssetAccessControl (Diamond Inheritance)", function () {

  async function deployFixture() {
    const [owner, alice, bob, charlie] = await ethers.getSigners();

    const DID = await ethers.getContractFactory("DIDRegistry");
    const did = await DID.deploy();
    await did.waitForDeployment();

    const Access = await ethers.getContractFactory("AssetAccessControl");
    const access = await Access.deploy(await did.getAddress());
    await access.waitForDeployment();

    return { did, access, owner, alice, bob, charlie };
  }

  it("accessPolicy - should return false if sender has no DID", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(bob).registerDID("ipfs://bobDID");

    const result = await access.accessPolicy(
      alice.address,
      bob.address,
      1
    );

    expect(result).to.equal(false);
  });

  it("accessPolicy - should return false if receiver has no DID", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");

    const result = await access.accessPolicy(
      alice.address,
      bob.address,
      1
    );

    expect(result).to.equal(false);
  });

  it("accessPolicy - should return false if fee is zero", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    const result = await access.accessPolicy(
      alice.address,
      bob.address,
      0
    );

    expect(result).to.equal(false);
  });

  it("accessPolicy - should return true if both users have DID and fee is paid", async function () {
    const { did, access, alice, bob } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    const result = await access.accessPolicy(
      alice.address,
      bob.address,
      1
    );

    expect(result).to.equal(true);
  });

  it("accessPolicy - should combine logic from both parents (diamond resolution)", async function () {
    const { did, access, alice, bob, charlie } = await deployFixture();

    await did.connect(alice).registerDID("ipfs://aliceDID");
    await did.connect(bob).registerDID("ipfs://bobDID");

    const ok = await access.accessPolicy(
      alice.address,
      bob.address,
      100
    );

    const failNoDID = await access.accessPolicy(
      alice.address,
      charlie.address,
      100
    );

    const failNoFee = await access.accessPolicy(
      alice.address,
      bob.address,
      0
    );

    expect(ok).to.equal(true);
    expect(failNoDID).to.equal(false);
    expect(failNoFee).to.equal(false);
  });

});
