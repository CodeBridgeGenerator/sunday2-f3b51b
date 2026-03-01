const assert = require("assert");
const app = require("../../src/app");

let usersRefData = [
  {
    name: "Standard User",
    email: "standard@example.com",
    password: "password",
  },
];

describe("highways service", async () => {
  let thisService;
  let highwayCreated;
  let usersServiceResults;
  let users;

  

  beforeEach(async () => {
    thisService = await app.service("highways");

    // Create users here
    usersServiceResults = await app.service("users").Model.create(usersRefData);
    users = {
      createdBy: usersServiceResults[0]._id,
      updatedBy: usersServiceResults[0]._id,
    };
  });

  after(async () => {
    if (usersServiceResults) {
      await Promise.all(
        usersServiceResults.map((i) =>
          app.service("users").Model.findByIdAndDelete(i._id)
        )
      );
    }
  });

  it("registered the service", () => {
    assert.ok(thisService, "Registered the service (highways)");
  });

  describe("#create", () => {
    const options = {"name":"new value"};

    beforeEach(async () => {
      highwayCreated = await thisService.Model.create({...options, ...users});
    });

    it("should create a new highway", () => {
      assert.strictEqual(highwayCreated.name, options.name);
    });
  });

  describe("#get", () => {
    it("should retrieve a highway by ID", async () => {
      const retrieved = await thisService.Model.findById(highwayCreated._id);
      assert.strictEqual(retrieved._id.toString(), highwayCreated._id.toString());
    });
  });

  describe("#update", () => {
    const options = {"name":"updated value"};

    it("should update an existing highway ", async () => {
      const highwayUpdated = await thisService.Model.findByIdAndUpdate(
        highwayCreated._id, 
        options, 
        { new: true } // Ensure it returns the updated doc
      );
      assert.strictEqual(highwayUpdated.name, options.name);
    });
  });

  describe("#delete", async () => {
    it("should delete a highway", async () => {
      await app
        .service("users")
        .Model.findByIdAndDelete(usersServiceResults._id);

      ;

      const highwayDeleted = await thisService.Model.findByIdAndDelete(highwayCreated._id);
      assert.strictEqual(highwayDeleted._id.toString(), highwayCreated._id.toString());
    });
  });
});