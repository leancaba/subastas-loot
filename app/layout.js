import "./globals.css";

export const metadata = {
  title: "Subastas Loot",
  description: "Subastas de productos por tiempo limitado",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-loot-black">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-black/10 px-4 py-6 text-center text-xs text-black/60">
      <p className="mx-auto max-w-3xl">
        El producto se puede retirar por el local y en caso de necesitar un
        envío corre a cargo del ganador de la subasta. Ofertar es un
        compromiso y en caso de resultar ganador nuestro equipo se pondrá en
        contacto con la persona para finalizar la operación, en caso de que
        la persona no finalice la transacción en 72hs el producto se vuelve
        a subastar.
      </p>
    </footer>
  );
}
