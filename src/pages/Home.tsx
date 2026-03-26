import { useEffect, useState, type FC } from 'react';
import SEO from '../components/SEO';
import HomeSkeleton from '../components/Skeletons/HomeSkeleton';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useGlobalStore } from '../stores/useGlobalStore';
import { HomeContentRepository } from '../repositories/HomeContentRepository';
import { PracticeAreasRepository } from '../repositories/PracticeAreasRepository';
import { PartnersRepository } from '../repositories/PartnersRepository';
import HomeRuntimeRenderer from '../components/Home/HomeRuntimeRenderer';
import { deepEqual } from '../utils/equality';
import { useHomeWidgets } from '../hooks/useHomeWidgets';

const HOME_WIDGETS_LOCAL_FALLBACK_KEY = 'home_widgets_local_fallback_v1';

const Home: FC = () => {
  const { settings, loading: loadingSettings } = useSiteSettings();
  const { widgets, loading: loadingWidgets } = useHomeWidgets();
  
  // Use Global Store (Already Hydrated by AppLoader)
  const { 
    isHydrated,
    homeHero,
    setHomeHero, setHomeAbout, setHomeCta, setPracticeAreas, setPartners
  } = useGlobalStore();
  
  // Local state for background loading
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/admin')) return;
    window.localStorage.removeItem(HOME_WIDGETS_LOCAL_FALLBACK_KEY);
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      // setIsRefreshing(true); // Already true on mount
      try {
        const [hero, about, cta, areas, partnerList] = await Promise.all([
          HomeContentRepository.getSection('hero'),
          HomeContentRepository.getSection('about'),
          HomeContentRepository.getSection('cta'),
          PracticeAreasRepository.getActive(),
          PartnersRepository.getActive()
        ]);

        // Obter estado atual para comparação
        const currentStore = useGlobalStore.getState();

        // Só atualiza se o conteúdo for DIFERENTE do cache
        if (hero?.content && !deepEqual(hero.content, currentStore.homeHero)) {
            setHomeHero(hero.content);
        }
        if (about?.content && !deepEqual(about.content, currentStore.homeAbout)) {
            setHomeAbout(about.content);
        }
        if (cta?.content && !deepEqual(cta.content, currentStore.homeCta)) {
            setHomeCta(cta.content);
        }
        
        // Comparação para arrays
        if (areas && !deepEqual(areas, currentStore.practiceAreas)) {
            setPracticeAreas(areas);
        }
        if (partnerList && !deepEqual(partnerList, currentStore.partners)) {
            setPartners(partnerList);
        }

      } catch (err) {
        console.error("Failed to load home content", err);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    // Always load fresh content on mount to ensure updates are reflected
    loadContent();
  }, [setHomeHero, setHomeAbout, setHomeCta, setPracticeAreas, setPartners]);

  // Combine loading states
  // We only show the skeleton if we have absolutely NO content to show (first load)
  // If we have cached content (homeHero etc), we show it while fetching updates in background
  const hasCachedContent = !!homeHero; 
  const hasCachedWidgets = widgets.length > 0;
  
  // Se não temos conteúdo em cache E não temos widgets em cache, e estamos carregando algo, mostramos o skeleton
  const showSkeleton = (!hasCachedContent && !hasCachedWidgets) && (loadingSettings || loadingWidgets || !isHydrated || isRefreshing);
  
  // Mostra em construção se terminou de carregar os widgets e a lista está vazia
  const showUnderConstruction = !showSkeleton && !loadingWidgets && widgets.length === 0;

  if (showSkeleton) {
    return (
      <div className="relative">
        <HomeSkeleton />
        {/* Optional: Show loading indicator even if skeleton is shown? No, skeleton implies loading. */}
      </div>
    );
  }

  if (showUnderConstruction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Em construção</h1>
          <p className="mt-3 text-gray-500">Estamos preparando esta página para você.</p>
        </div>
      </div>
    );
  }
  
  // Use content from store or fallback to defaults (although defaults are also handled inside components)
  const hero = homeHero;

  const imageSettings = settings?.image_settings;
  const bannerUrl = (imageSettings && typeof imageSettings === 'object' && 'banner_url' in imageSettings)
    ? (imageSettings as { banner_url?: string }).banner_url
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title={hero?.title || "Home"}
        description={hero?.description || settings?.site_description || 'Excelência técnica e compromisso com a qualidade.'}
        image={hero?.background_image || bannerUrl}
      />
      
      <HomeRuntimeRenderer
        widgets={widgets}
      />
    </div>
  );
};

export default Home;
