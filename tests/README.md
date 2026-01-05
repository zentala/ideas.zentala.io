# Testy GUI dla ideas.zentala.io

Ten katalog zawiera testy interfejsu użytkownika (GUI) napisane w Playwright do testowania strony ideas.zentala.io.

## Dostępne testy

- **Home Page** (`home.spec.js`) - Testuje stronę główną i selektor języków
- **Tags** (`tags.spec.js`) - Testuje funkcjonalność chmury tagów i stron z tagami
- **Posts** (`posts.spec.js`) - Testuje wyświetlanie, nawigację i powiązane posty
- **API** (`api.spec.js`) - Testuje API powiązanych postów
- **Navigation** (`navigation.spec.js`) - Testuje nawigację po stronie i elementy layoutu

## Uruchamianie testów

Możesz uruchomić testy używając jednej z następujących komend:

```bash
# Uruchom wszystkie testy w trybie headless (bez widocznej przeglądarki)
npm run test

# Uruchom testy z widocznym interfejsem użytkownika Playwright
npm run test:ui

# Uruchom testy z widoczną przeglądarką
npm run test:headed

# Uruchom testy w trybie debugowania
npm run test:debug
```

## Konfiguracja

Testy są skonfigurowane w pliku `playwright.config.js` w głównym katalogu projektu. Ta konfiguracja:

- Automatycznie uruchamia serwer deweloperski przed testami
- Zapisuje zrzuty ekranu w przypadku niepowodzeń testów
- Generuje raport HTML z wynikami testów

## Dodawanie nowych testów

Aby dodać nowy test:

1. Utwórz nowy plik `.spec.js` w katalogu `tests/`
2. Importuj `{ test, expect } from '@playwright/test'`
3. Napisz testy używając API Playwright
4. Uruchom testy używając jednej z powyższych komend

## Generowanie testów dla nowych funkcji

Gdy dodajesz nową funkcję do strony, rozważ dodanie testów sprawdzających:

1. Czy funkcja jest dostępna na właściwych stronach
2. Czy funkcja reaguje poprawnie na interakcje użytkownika
3. Czy funkcja zachowuje się poprawnie w różnych językach
4. Czy funkcja jest dostępna z klawiatury (dostępność)

## Raportowanie problemów

Jeśli znajdziesz problem z testami, zgłoś go dodając komentarz w kodzie lub otwierając issue w repozytorium.