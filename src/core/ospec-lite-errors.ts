export class OSpecLiteError extends Error {}

export class InitIncompleteError extends OSpecLiteError {
  constructor(public readonly missingMarkers: string[]) {
    super(`Initialization is incomplete. Missing markers: ${missingMarkers.join(", ")}`);
  }
}

export class NotInitializedError extends OSpecLiteError {
  constructor(rootDir: string) {
    super(`Repository is not initialized for ospec-lite: ${rootDir}`);
  }
}

export class InvalidChangeSlugError extends OSpecLiteError {
  constructor(slug: string) {
    super(`Invalid change slug: ${slug}`);
  }
}

export class UnknownProfileError extends OSpecLiteError {
  constructor(profileId: string) {
    super(`Unknown profile: ${profileId}`);
  }
}

export class InvalidProfileError extends OSpecLiteError {
  constructor(message: string) {
    super(message);
  }
}

export class ProfilePreconditionError extends OSpecLiteError {
  constructor(
    public readonly profileId: string,
    public readonly missingRepoPaths: string[]
  ) {
    super(
      `Profile ${profileId} requires these repo paths: ${missingRepoPaths.join(", ")}`
    );
  }
}

export class ProfileInitAnswersRequiredError extends OSpecLiteError {
  constructor(
    public readonly profileId: string,
    public readonly missingFields: string[]
  ) {
    super(
      `Profile ${profileId} requires these init values in non-interactive mode: ${missingFields.join(", ")}`
    );
  }
}

export class DocVerificationError extends OSpecLiteError {
  constructor(
    public readonly profileId: string,
    public readonly checklistPath: string,
    public readonly issues: { file: string; message: string }[]
  ) {
    super(
      `Documentation verification failed for profile ${profileId}: ${issues.length} issue(s).`
    );
  }
}
