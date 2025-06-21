
export class BestAuthError extends Error {
    constructor(message: string, cause?:string) {
        super(message);
        this.name = "BestAuthError";
        this.message = message;
        this.cause = cause;
        this.stack = "";
    }
}


export class MissingDependencyError extends BestAuthError {
    constructor(pkg_name: string) {
        super(
            ` The package ${pkg_name} is missing. Please install it and try again.`,
        )
    }
}