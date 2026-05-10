import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Container from "../components/layout/Container.jsx";
import PageContainer from "../components/layout/PageContainer.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </Container>
      </main>
    </div>
  );
}
