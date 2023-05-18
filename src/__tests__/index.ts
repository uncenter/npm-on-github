import { getOwnerAndRepo } from "../utils";

describe("getOwnerAndRepo", () => {
    it("should return owner and repo", () => {
        expect(
            getOwnerAndRepo("https://github.com/uncenter/npm-on-github")
        ).toEqual({ owner: "uncenter", repo: "npm-on-github" });
    });
    it("should return owner and repo for git+https", () => {
        expect(
            getOwnerAndRepo("git+https://github.com/uncenter/npm-on-github.git")
        ).toEqual({ owner: "uncenter", repo: "npm-on-github" });
    });
    it("should return owner and repo for git+ssh", () => {
        expect(
            getOwnerAndRepo("git+ssh://github.com/uncenter/npm-on-github.git")
        ).toEqual({ owner: "uncenter", repo: "npm-on-github" });
    });
    it("should return owner and repo for git", () => {
        expect(
            getOwnerAndRepo("git://github.com/uncenter/npm-on-github.git")
        ).toEqual({ owner: "uncenter", repo: "npm-on-github" });
    });
    it("should return owner and repo with no .git", () => {
        expect(
            getOwnerAndRepo("git+https://github.com/uncenter/npm-on-github")
        ).toEqual({ owner: "uncenter", repo: "npm-on-github" });
    });
    it("should rturn owner and repo if .git is in the middle", () => {
        expect(
            getOwnerAndRepo("git+https://github.com/example/.gitingore")
        ).toEqual({ owner: "example", repo: ".gitingore" });
    });
    it("should return null if no owner or repo", () => {
        expect(getOwnerAndRepo("git+https://github.com")).toEqual(null);
    });
});
