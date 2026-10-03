import { ensureDemoProfile } from "./demoProfile";
import { doc, getDoc, setDoc } from "./firebase";

jest.mock("./firebase", () => ({
  db: {},
  doc: jest.fn(() => "demo-user-ref"),
  getDoc: jest.fn(),
  setDoc: jest.fn()
}));

describe("ensureDemoProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    doc.mockReturnValue("demo-user-ref");
  });

  it("creates a profile for a new anonymous user", async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue(undefined);
    const user = { uid: "demo-uid", email: null };

    const profile = await ensureDemoProfile(user);

    expect(doc).toHaveBeenCalledWith({}, "users", "demo-uid");
    expect(setDoc).toHaveBeenCalledWith("demo-user-ref", expect.objectContaining({
      name: "DevConnect Demo",
      email: "",
      isDemo: true
    }));
    expect(profile.name).toBe("DevConnect Demo");
  });

  it("keeps an existing demo profile", async () => {
    const existingProfile = { name: "Existing Demo" };
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => existingProfile
    });

    await expect(ensureDemoProfile({ uid: "demo-uid" })).resolves.toBe(existingProfile);
    expect(setDoc).not.toHaveBeenCalled();
  });
});
