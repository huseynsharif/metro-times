# Əhmədli ⇄ Həzi Aslanov — qatar vaxtı

Bakı metrosunda **Əhmədli – Həzi Aslanov** arasında işləyən müvəqqəti məkik
qatarının növbəti çatma vaxtını bir ekranda göstərən sadə veb sayt.

Qatarın intervalı standart deyil — saata görə dəyişir (7 → 5 → 7 dəqiqə) və
insanlar bunu tez-tez unudur. Bu sayt **Bakı vaxtına** (UTC+4) əsasən hər iki
stansiya üçün geri sayımı canlı göstərir, beləcə evdən çıxma vaxtını dəqiq
hesablamaq olur.

## Xüsusiyyətlər

- **İki stansiya, bir ekran** — scroll etmədən hər ikisi görünür.
- **Böyük geri sayım** (dəq:san) + altında növbəti çatma vaxtı (HH:MM) və sonrakı reys.
- **Bakı vaxtı** ilə işləyir — cihazın saat qurşağından asılı deyil.
- İş günləri / şənbə-bazar cədvəlləri avtomatik seçilir, gecə yarısından
  sonrakı reyslər düzgün idarə olunur.
- **Mobile-first**, bütün ekranlara responsive.

## İstifadə

Heç bir asılılıq yoxdur — `index.html` faylını brauzerdə açın və ya statik
hostingə (GitHub Pages və s.) qoyun.

## Fayllar

- `index.html` — quruluş
- `style.css` — dizayn (scroll-suz, tam ekran)
- `app.js` — cədvəl və hesablama məntiqi

## Qeyd

Cədvəl rəsmi **"Əhmədlidən yola düşmə vaxtı"** məlumatına əsaslanır.
Həzi Aslanova çatma vaxtı qonşu stansiya gediş müddəti (~2 dəq) əlavə
edilərək hesablanır (`app.js` içində `TRAVEL_MIN`).
