{ inputs, ... }:
{
  perSystem =
    {
      config,
      pkgs,
      system,
      ...
    }:
    let
      mcpConfig = inputs.mcp-servers-nix.lib.mkConfig (import inputs.mcp-servers-nix.inputs.nixpkgs {
        inherit system;
      }) {
        programs.terraform.enable = true;
      };

      devPackages =
        config.pre-commit.settings.enabledPackages
        ++ (with pkgs; [
          opentofu
          graphviz # diagrams dependency
          (python3.withPackages (ps: [ ps.diagrams ]))
        ]);
    in
    {
      devShells.default = pkgs.mkShell {
        buildInputs = devPackages;

        shellHook = ''
          ${config.pre-commit.shellHook}
          cat ${mcpConfig} > .mcp.json
          echo "Generated .mcp.json"
        '';
      };
    };
}
