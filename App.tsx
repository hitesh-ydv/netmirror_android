import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import AnimatedSplash from 'react-native-animated-splash-screen';
import { WebView } from 'react-native-webview';
import { decode as atob } from 'base-64';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';


const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isConnected, setIsConnected] = useState(true);


  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%'], []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);


  const loadData = useCallback(async () => {
    setIsFetching(true);
    setHasError(false);
    setWebviewUrl(null);

    try {
      const response = await fetch('https://mobiledetects.com/check.php');
      const data = await response.json();

      if (data?.token_hash) {
        const decodedUrl = atob(data.token_hash);
        setWebviewUrl(decodedUrl);
      } else {
        throw new Error('Invalid token_hash');
      }
    } catch (error) {
      console.error('Error fetching or decoding token_hash:', error);
      setHasError(true);
    } finally {
      setIsFetching(false);
      setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const openBottomSheet = () => {
    bottomSheetRef.current?.expand();
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <AnimatedSplash
        translucent
        isLoaded={isLoaded}
        logoImage={require('./assets/splash.png')}
        backgroundColor="#000000"
        logoHeight={110}
        logoWidth={110}
      >
        {!isConnected ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>📡</Text>
            <Text style={styles.errorText}>No Internet Connection</Text>
            <Text style={styles.subText}>Please check your network and try again.</Text>
            <TouchableOpacity onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryText}>🔄 Retry</Text>
            </TouchableOpacity>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>Something Went Wrong</Text>
            <Text style={styles.subText}>We couldn't load the content. Try again later.</Text>
            <TouchableOpacity onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryText}>↻ Retry</Text>
            </TouchableOpacity>
          </View>
        ) : webviewUrl ? (
          <>
            <WebView source={{ uri: webviewUrl }} style={{ flex: 1 }} />
            <TouchableOpacity style={styles.floatingButton} onPress={openBottomSheet}>
              <Text style={styles.floatingButtonText}>⚙️</Text>
            </TouchableOpacity>

            <BottomSheet
              ref={bottomSheetRef}
              index={-1}
              snapPoints={snapPoints}
              enablePanDownToClose={true}
              backgroundStyle={{ backgroundColor: '#fff' }}
              handleIndicatorStyle={{ backgroundColor: '#ccc' }}
            >
              <View style={styles.bottomSheet}>
                <Text style={styles.sheetTitle}>⚙️ Settings</Text>
                <TouchableOpacity style={styles.sheetOption}>
                  <Text style={styles.sheetOptionText}>Clear Cache</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption}>
                  <Text style={styles.sheetOptionText}>Reload Page</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => bottomSheetRef.current?.close()}
                >
                  <Text style={styles.sheetOptionText}>Close</Text>
                </TouchableOpacity>
              </View>
            </BottomSheet>
          </>
        ) : null}
      </AnimatedSplash>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#00ffcc',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 5,
    backgroundColor: '#00ffcc',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  floatingButtonText: { fontSize: 24 },
  bottomSheet: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sheetOption: {
    paddingVertical: 12,
  },
  sheetOptionText: {
    fontSize: 16,
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  errorEmoji: { fontSize: 60, marginBottom: 15 },
  errorText: {
    color: '#ff4d4d',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
    
});

export default App;
