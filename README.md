# 📷 Galeria

Mobilna aplikacja galerii zdjęć napisana w **React Native** z użyciem **Expo**. Umożliwia przeglądanie zdjęć, robienie zdjęć aparatem oraz ich edycję przy użyciu filtrów.

---

## Funkcje

- **Przeglądanie zdjęć** — siatka 3x3 z miniaturkami
- **Import z galerii** — wybór wielu zdjęć naraz z galerii systemowej
- **Aparat** — robienie zdjęć bezpośrednio w aplikacji
- **Edytor filtrów** — trzy filtry do wyboru:
  - 🌫️ **Blur** — rozmycie zdjęcia
  - 🟤 **Sepia** — ciepły, brązowy filtr
  - ◑ **Kontrast** — wzmocnienie kontrastu
- **Usuwanie zdjęć** — długie przytrzymanie miniaturki

---

## Wymagania

- Node.js (wersja 18 lub nowsza)
- Expo Go (na telefonie) **lub** emulator Android w Android Studio

---

## Instalacja i uruchomienie

### 1. Sklonuj / pobierz projekt i przejdź do folderu

```bash
cd galeria
```

### 2. Zainstaluj zależności

```bash
npm install
npx expo install expo-image-picker @expo/vector-icons
```

### 3. Uruchom serwer deweloperski

```bash
npx expo start
```

### 4. Otwórz aplikację

- **Emulator Android** — wciśnij `a` w terminalu
- **Telefon fizyczny** — zeskanuj kod QR aplikacją **Expo Go**

---

## Struktura projektu

```
galeria/
├── app/
│   └── index.tsx        # Główny plik aplikacji
├── assets/              # Ikony i splash screen
├── app.json             # Konfiguracja Expo
└── package.json         # Zależności projektu
```

### Opis `index.tsx`

Cały kod aplikacji znajduje się w jednym pliku `app/index.tsx` i składa się z:

| Element | Opis |
|---|---|
| `type Filter` | Typ TypeScript definiujący dostępne filtry |
| `interface Photo` | Struktura obiektu zdjęcia (id, uri, filtr) |
| `FilteredImage` | Komponent renderujący zdjęcie z wybranym filtrem |
| `App` | Główny komponent — zarządza stanem i nawigacją |

Filtry są implementowane przez nakładki kolorowe (`View` z `backgroundColor`) oraz właściwość `blurRadius` komponentu `Image` — bez zewnętrznych bibliotek do edycji obrazu.

---

## Użyte technologie

| Technologia | Wersja | Zastosowanie |
|---|---|---|
| React Native | via Expo | Framework mobilny |
| Expo | latest | Toolchain i SDK |
| expo-image-picker | latest | Dostęp do kamery i galerii |
| @expo/vector-icons (Ionicons) | latest | Ikonki UI |
| TypeScript | latest | Typowanie |

## Autor
Krystian Tarnowski
