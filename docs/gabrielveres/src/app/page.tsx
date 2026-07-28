import { GradientOverlays } from "@/components/GradientOverlays";
import { ProjectScene } from "@/components/ProjectScene";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <ProjectScene />
      <GradientOverlays />
      <SiteHeader />
      <SiteFooter />
    </>
  );
}
