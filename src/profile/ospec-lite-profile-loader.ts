import * as path from "node:path";
import {
  LoadedOSpecLiteProfile,
  OSpecLiteProfile,
  OSpecLiteProfileAsset,
  ProfileTemplateValues
} from "../core/ospec-lite-types";
import { FileRepo } from "../fs/file-repo";
import { InvalidProfileError, UnknownProfileError } from "../core/ospec-lite-errors";
import { ProfileTemplateService } from "./ospec-lite-profile-template-service";

export class ProfileLoader {
  private readonly templates = new ProfileTemplateService();

  constructor(
    private readonly repo: FileRepo,
    private readonly profilesRoot = path.resolve(__dirname, "..", "..", "profiles")
  ) {}

  async loadProfile(profileId: string): Promise<LoadedOSpecLiteProfile> {
    const rootDir = path.join(this.profilesRoot, profileId);
    const profileJsonPath = path.join(rootDir, "profile.json");

    if (!(await this.repo.exists(profileJsonPath))) {
      throw new UnknownProfileError(profileId);
    }

    const profile = await this.repo.readJson<OSpecLiteProfile>(profileJsonPath);
    this.validateProfile(profile, profileId);

    return {
      ...profile,
      rootDir,
      profileJsonPath
    };
  }

  renderAsset(
    profile: LoadedOSpecLiteProfile,
    asset: OSpecLiteProfileAsset,
    values: ProfileTemplateValues
  ): string {
    return this.templates.renderTemplate(profile.rootDir, asset.source, values);
  }

  private validateProfile(profile: OSpecLiteProfile, expectedId: string): void {
    if (profile.version !== 1) {
      throw new InvalidProfileError(`Unsupported profile version: ${profile.version}`);
    }
    if (profile.id !== expectedId) {
      throw new InvalidProfileError(
        `Profile id mismatch: expected ${expectedId}, found ${profile.id}`
      );
    }
    if (!profile.authoringPackRoot) {
      throw new InvalidProfileError(`Profile ${profile.id} is missing authoringPackRoot.`);
    }
    if (!Array.isArray(profile.assets) || profile.assets.length === 0) {
      throw new InvalidProfileError(`Profile ${profile.id} does not define any assets.`);
    }
    if (
      profile.requiredRepoPaths &&
      (!Array.isArray(profile.requiredRepoPaths) ||
        profile.requiredRepoPaths.some((item) => typeof item !== "string" || item.length === 0))
    ) {
      throw new InvalidProfileError(
        `Profile ${profile.id} has invalid requiredRepoPaths declarations.`
      );
    }

    for (const asset of profile.assets) {
      if (!asset.source || !asset.target) {
        throw new InvalidProfileError(
          `Profile ${profile.id} contains an invalid asset declaration.`
        );
      }
    }
  }
}
