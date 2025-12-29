{
  description = "KDL REPL - A mobile-friendly, interactive KDL (KDL Document Language) REPL";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Node.js version to use (18+)
        nodejs = pkgs.nodejs_22;

        # pnpm with the specified Node.js version
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
            echo "KDL REPL Development Environment"
            echo "================================"
            echo "Node.js version: $(node --version)"
            echo "pnpm version: $(pnpm --version)"
            echo ""
            echo "Available commands:"
            echo "  pnpm install       - Install dependencies"
            echo "  pnpm dev           - Start development server"
            echo "  pnpm build         - Build for production"
            echo "  pnpm test          - Run unit tests"
            echo "  pnpm test:e2e      - Run E2E tests"
            echo "  pnpm test:all      - Run all tests"
            echo ""

            # Set up Playwright
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          '';
        };

        # Package output
        packages.default = pkgs.buildNpmPackage {
          pname = "kdl-repl";
          version = "1.0.0";

          src = ./.;

          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

          nativeBuildInputs = [
            nodejs
            pnpm.configHook
          ];

          buildPhase = ''
            runHook preBuild
            pnpm build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist/* $out/
            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description = "A mobile-friendly, interactive KDL REPL built with vanilla JavaScript";
            homepage = "https://github.com/hawkrives/vibes";
            license = licenses.isc;
            maintainers = [ ];
            platforms = platforms.all;
          };
        };
      }
    );
}
