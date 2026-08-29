import logo from "@/assets/images/logo_transparent11.webp";

export function HeaderLogo() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
                <img src={logo} alt="Logo APM SYN" className="w-10 h-10 object-contain" />
            </div>
            <div className="hidden md:flex md:flex-col">
                <span className="font-space-grotesk text-lg font-bold text-foreground leading-tight">
                    APM Syn
                </span>
                <span className="text-[10px] text-foreground-muted leading-tight">
                    Asset Portfolio Manager
                </span>
            </div>
        </div>
    );
}