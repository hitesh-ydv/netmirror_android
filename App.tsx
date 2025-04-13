import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

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

  const openSheet = () => bottomSheetRef.current?.expand();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <AnimatedSplash
        translucent
        isLoaded={isLoaded}
        logoImage={require('./assets/splash.png')}
        backgroundColor="#000000"
        logoHeight={110}
        logoWidth={110}
      >
        {isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ffcc" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>Something Went Wrong</Text>
            <TouchableOpacity onPress={loadData} style={styles.retryButton}>
              <Text style={styles.retryText}>↻  Retry</Text>
            </TouchableOpacity>
          </View>
        ) : webviewUrl ? (
          <>
            <WebView source={{ uri: webviewUrl }} style={{ flex: 1 }} />
            <TouchableOpacity style={styles.floatingButton} onPress={openSheet}>
              <Text style={styles.floatingButtonText}>⚙️</Text>
            </TouchableOpacity>

            <BottomSheet
              ref={bottomSheetRef}
              snapPoints={snapPoints}
              index={-1}
              backgroundStyle={{ backgroundColor: '#fff' }}
              handleIndicatorStyle={{ backgroundColor: '#ccc' }}
            >
              <View style={styles.sheetContent}>
                <Text style={styles.sheetTitle}>Settings</Text>
                <TouchableOpacity style={styles.sheetOption}>
                  <Text>Clear Cache</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption}>
                  <Text>Reload</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#00ffcc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 50,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 18,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#00ffcc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#000',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#00ffcc',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 22,
  },
  sheetContent: {
    flex: 1,
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sheetOption: {
    paddingVertical: 10,
  },
});

export default App;
