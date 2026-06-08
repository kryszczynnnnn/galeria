import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");
const THUMB_SIZE = (SCREEN_W - 4) / 3;

type Filter = "none" | "sepia" | "blur" | "contrast";

interface Photo {
  id: string;
  uri: string;
  filter: Filter;
}

const FILTER_LABELS: Record<Filter, string> = {
  none: "Oryginał",
  sepia: "Sepia",
  blur: "Blur",
  contrast: "Kontrast",
};

const FILTER_ICONS: Record<Filter, string> = {
  none: "image-outline",
  sepia: "color-filter-outline",
  blur: "eye-off-outline",
  contrast: "contrast-outline",
};


function FilteredImage({
  uri,
  filter,
  style,
}: {
  uri: string;
  filter: Filter;
  style?: object;
}) {
  const containerStyle = [styles.filteredContainer, style];

  if (filter === "blur") {
    return (
      <View style={containerStyle}>
        <Image source={{ uri }} style={styles.fillImage} blurRadius={8} />
      </View>
    );
  }

  if (filter === "sepia") {
    return (
      <View style={containerStyle}>
        <Image source={{ uri }} style={[styles.fillImage, { opacity: 0.85 }]} />
        <View
          style={[
            styles.filterOverlay,
            { backgroundColor: "rgba(112, 66, 20, 0.45)" },
          ]}
        />
      </View>
    );
  }

  if (filter === "contrast") {
    return (
      <View style={containerStyle}>
        <Image source={{ uri }} style={styles.fillImage} />
        <View
          style={[
            styles.filterOverlay,
            { backgroundColor: "rgba(0,0,0,0.18)" },
          ]}
        />
        <View
          style={[
            styles.filterOverlay,
            { backgroundColor: "rgba(255,255,255,0.08)" },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image source={{ uri }} style={styles.fillImage} />
    </View>
  );
}


export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("none");


  const requestPermissions = async () => {
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: camStatus } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (mediaStatus !== "granted" || camStatus !== "granted") {
      Alert.alert(
        "Brak uprawnień",
        "Aplikacja potrzebuje dostępu do galerii i aparatu.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickFromGallery = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      const newPhotos: Photo[] = result.assets.map((a) => ({
        id: a.assetId ?? `${Date.now()}-${Math.random()}`,
        uri: a.uri,
        filter: "none",
      }));
      setPhotos((prev) => [...newPhotos, ...prev]);
    }
  }, []);


  const takePhoto = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newPhoto: Photo = {
        id: `${Date.now()}`,
        uri: asset.uri,
        filter: "none",
      };
      setPhotos((prev) => [newPhoto, ...prev]);
    }
  }, []);


  const openEditor = (photo: Photo) => {
    setSelected(photo);
    setActiveFilter(photo.filter);
  };

  const confirmEdit = () => {
    if (!selected) return;
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, filter: activeFilter } : p
      )
    );
    setSelected(null);
  };


  const deletePhoto = (id: string) => {
    Alert.alert("Usuń zdjęcie", "Na pewno chcesz usunąć to zdjęcie?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => setPhotos((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  };


  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>GALERIA</Text>
        <Text style={styles.headerCount}>{photos.length} zdjęć</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Aparat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={22} color="#fff" />
          <Text style={styles.actionLabel}>Galeria</Text>
        </TouchableOpacity>
      </View>
      
      {photos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="camera-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>Brak zdjęć</Text>
          <Text style={styles.emptySubtext}>
            Zrób zdjęcie lub wybierz z galerii
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.thumb}
              onPress={() => openEditor(item)}
              onLongPress={() => deletePhoto(item.id)}
              activeOpacity={0.8}
            >
              <FilteredImage
                uri={item.uri}
                filter={item.filter}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              />
              {item.filter !== "none" && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {FILTER_LABELS[item.filter]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.modal}>
          {selected && (
            <>
              
              <View style={styles.preview}>
                <FilteredImage
                  uri={selected.uri}
                  filter={activeFilter}
                  style={styles.previewInner}
                />
              </View>

              
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filtry</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(["none", "sepia", "blur", "contrast"] as Filter[]).map(
                    (f) => (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.filterChip,
                          activeFilter === f && styles.filterChipActive,
                        ]}
                        onPress={() => setActiveFilter(f)}
                      >
                        <Ionicons
                          name={FILTER_ICONS[f] as any}
                          size={20}
                          color={activeFilter === f ? "#0a0a0a" : "#aaa"}
                        />
                        <Text
                          style={[
                            styles.filterChipLabel,
                            activeFilter === f && styles.filterChipLabelActive,
                          ]}
                        >
                          {FILTER_LABELS[f]}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              
              <View style={styles.editorActions}>
                <TouchableOpacity
                  style={styles.editorBtnSecondary}
                  onPress={() => setSelected(null)}
                >
                  <Ionicons name="close-outline" size={20} color="#aaa" />
                  <Text style={styles.editorBtnLabelSecondary}>Anuluj</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editorBtnPrimary}
                  onPress={confirmEdit}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#0a0a0a" />
                  <Text style={styles.editorBtnLabelPrimary}>Zastosuj</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 4,
  },
  headerCount: {
    fontSize: 13,
    color: "#555",
    letterSpacing: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  actionLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  grid: {
    gap: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    margin: 1,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  filterBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    color: "#444",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
  },
  emptySubtext: {
    color: "#333",
    fontSize: 13,
  },
  modal: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  preview: {
    flex: 1,
    margin: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  previewInner: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e1e1e",
  },
  filterSectionTitle: {
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginLeft: 8,
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#161616",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  filterChipActive: {
    backgroundColor: "#e5e5e5",
    borderColor: "#e5e5e5",
  },
  filterChipLabel: {
    color: "#777",
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipLabelActive: {
    color: "#0a0a0a",
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "android" ? 24 : 8,
    paddingTop: 8,
  },
  editorBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#161616",
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  editorBtnLabelSecondary: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  editorBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    paddingVertical: 13,
  },
  editorBtnLabelPrimary: {
    color: "#0a0a0a",
    fontSize: 13,
    fontWeight: "700",
  },
  filteredContainer: {
    overflow: "hidden",
    backgroundColor: "#111",
  },
  fillImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  filterOverlay: {
    ...StyleSheet.absoluteFill,
  },
});
