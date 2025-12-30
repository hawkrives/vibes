{
  description = "KDL REPL - A mobile-friendly, interactive KDL REPL";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Node.js version (matching the 18+ requirement)
        nodejs = pkgs.nodejs_20;

        # pnpm for package management
        pnpm = pkgs.pnpm;
      in
      {
        # Development shell
        devShells.default = pkgs.mkShell {
          buildInputs = [
            nodejs
            pnpm
            # Playwright dependencies for E2E tests
            pkgs.playwright-driver.browsers
          ];

          shellHook = ''
            echo "KDL REPL development environment"
            echo "Node version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo ""
            echo "Available commands:"
            echo "  pnpm install    - Install dependencies"
            echo "  pnpm dev        - Start development server"
            echo "  pnpm build      - Build for production"
            echo "  pnpm test       - Run unit tests"
            echo "  pnpm test:e2e   - Run E2E tests"
            echo "  pnpm test:all   - Run all tests"

            # Set Playwright to use the Nix-provided browsers
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          '';
        };

        # Optional: Package the built application
        packages.default = pkgs.buildNpmPackage {
          pname = "kdl-repl";
          version = "1.0.0";

          src = ./.;

          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

          nativeBuildInputs = [ nodejs pnpm ];

          buildPhase = ''
            pnpm build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out/
          '';
        };
      }
    );
}
