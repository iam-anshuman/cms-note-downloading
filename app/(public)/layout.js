import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import CartDrawer from "../components/CartDrawer";
import CartSync from "../components/CartSync";

export default function PublicLayout({ children }) {
  return (
    <>
      <CartSync />
      <PublicNav />
      <CartDrawer />
      <main className="pt-20 min-h-screen">{children}</main>
      <PublicFooter />
    </>
  );
}
