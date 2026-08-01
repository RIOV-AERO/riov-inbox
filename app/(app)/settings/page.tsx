import { requireUser } from "@/lib/auth/session";
import { FolderHeader } from "@/components/layout/FolderHeader";
import { ProfileForm } from "./_components/ProfileForm";
import { PasswordForm } from "./_components/PasswordForm";
import { DensityControl } from "./_components/DensityControl";
import { SettingToggle } from "./_components/SettingToggle";
import { RegisteredEmailsControl } from "./_components/RegisteredEmailsControl";
import {
  setLoadExternalImagesAction,
  setDesktopNotificationsAction,
  setReceiveUnregisteredEmailsAction,
} from "./actions";

export const dynamic = "force-dynamic";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border-faint py-3.5 last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-[12.5px] text-ink-muted">{description}</div>
      </div>
      {children}
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <FolderHeader title="Configurações" />
      <div className="mx-auto flex w-full max-w-160 flex-1 flex-col gap-8 px-5 py-7 md:px-7 overflow-y-auto min-h-0">
        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
            Conta
          </div>
          <ProfileForm
            name={user.name}
            email={user.email}
            signature={user.signature ?? ""}
          />
        </section>

        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
            Senha
          </div>
          <PasswordForm />
        </section>

        <section className="flex flex-col gap-1">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
            E-mails e Visibilidade
          </div>
          <div className="flex flex-col gap-2.5 border-b border-border-faint py-3.5">
            <div className="flex flex-col gap-0.5">
              <div className="text-sm font-medium text-ink">
                Endereços e setores adicionais
              </div>
              <div className="text-[12.5px] text-ink-muted">
                Cadastre e-mails ou setores (ex: financeiro, vendas) para
                receber e visualizar mensagens endereçadas a eles.
              </div>
            </div>
            <RegisteredEmailsControl initialEmails={user.registeredEmails} />
          </div>
          <SettingRow
            title="Receber e-mails não registrados"
            description="Exibir e-mails recebidos em endereços genéricos ou incorretos que não pertencem a nenhum funcionário."
          >
            <SettingToggle
              initialValue={user.receiveUnregisteredEmails}
              onToggle={setReceiveUnregisteredEmailsAction}
            />
          </SettingRow>
        </section>

        <section className="flex flex-col gap-1">
          <div className="mb-2 text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
            Preferências
          </div>
          <SettingRow
            title="Densidade da lista"
            description="Quanta informação cabe em cada linha"
          >
            <DensityControl initialValue={user.density} />
          </SettingRow>
          <SettingRow
            title="Carregar imagens externas"
            description="Bloqueadas por padrão em e-mails HTML"
          >
            <SettingToggle
              initialValue={user.loadExternalImages}
              onToggle={setLoadExternalImagesAction}
            />
          </SettingRow>
          <SettingRow
            title="Notificações no desktop"
            description="Avisar quando chegar e-mail novo"
          >
            <SettingToggle
              initialValue={user.desktopNotifications}
              onToggle={setDesktopNotificationsAction}
            />
          </SettingRow>
        </section>
      </div>
    </div>
  );
}
