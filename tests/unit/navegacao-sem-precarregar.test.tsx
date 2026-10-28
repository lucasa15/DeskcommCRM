import type { ComponentProps } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a {...props} data-prefetch={String(prefetch)} />
  ),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/app/settings" }));
vi.mock("@/hooks/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: { is_platform_admin: false },
    activeOrg: { orgId: "org-1", name: "Org", role: "admin" },
  }),
  usePermission: () => false,
}));
vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (s: string) => s }));
vi.mock("@/components/connections/ConnectionHealthDot", () => ({
  ConnectionHealthDot: () => null,
}));
vi.mock("@/components/shell/ContadorDeCasos", () => ({ ContadorDeCasos: () => null }));
vi.mock("@/components/shell/ContadorDaFila", () => ({ ContadorDaFila: () => null }));
vi.mock("@/components/shell/VersionFooter", () => ({ VersionFooter: () => null }));
vi.mock("@/components/shell/MobileSidebar", () => ({ GavetaDeNavegacao: () => null }));
vi.mock("@/app/actions/shell/toggleSidebar", () => ({ toggleSidebar: vi.fn() }));

import { Sidebar } from "@/components/shell/Sidebar";
import { BarraInferior } from "@/components/shell/BarraInferior";
import { NavHub } from "@/components/shell/NavHub";

afterEach(cleanup);

describe("navegação sem competir com a tela aberta", () => {
  it.each([
    ["menu lateral", () => <Sidebar collapsed={false} />],
    ["abas do celular", () => <BarraInferior />],
    [
      "hub de configurações",
      () => (
        <NavHub
          group="organizacao"
          role="admin"
          isPlatformAdmin={false}
          title="Configurações"
          subtitle=""
          modulosLigados={[]}
        />
      ),
    ],
  ] as const)("%s só solicita o destino quando a pessoa navega", (_nome, montar) => {
    render(montar());
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(2);
    for (const link of links) {
      expect(link).toHaveAttribute("data-prefetch", "false");
      expect(link.getAttribute("href")).toMatch(/^\/app\//);
    }
  });
});
