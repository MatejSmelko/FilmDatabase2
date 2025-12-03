import { CapacitorConfig } from '@capacitor/cli';

    const config: CapacitorConfig = {
      appId: 'com.yourname.moviedb', // Změň na unikátní ID (např. com.matej.moviedb)
      appName: 'MovieDB',             // Název aplikace, který se ukáže pod ikonou
      webDir: 'www',                  // Složka, kam se Angular kompiluje
      server: {
        androidScheme: 'https'
      },
      plugins: {
        SplashScreen: {
          launchShowDuration: 3000,
          launchAutoHide: true,
          // Nastavíme barvu status baru v mobilu na tmavou (jako tvoje appka)
          backgroundColor: '#121212', 
          androidStatusBarBackgroundColor: '#121212',
          androidScaleType: 'CENTER_CROP',
          showSpinner: true,
          splashFullScreen: true,
          splashImmersive: true,
          layoutName: "launch_screen",
          useIconColor: false
        }
      }
    };

    export default config;
