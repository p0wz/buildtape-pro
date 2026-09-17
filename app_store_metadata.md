# BuildTape Pro - Complete App Store Metadata & ASO Guide

Tüm App Store Connect alanları ve Apple onayına %100 uyumlu, ASO (App Store Optimization) odaklı tam liste:

---

## 1. App Information (Uygulama Bilgileri Sayfası)

### Name (Uygulama Adı) [Maks: 30 karakter]
```text
BuildTape Pro
```
*(13 karakter - Temiz, profesyonel marka adı)*

### Subtitle (Alt Başlık) [Maks: 30 karakter]
```text
Construction & Tape Calculator
```
*(Tam 30 karakter! ASO arama algoritmalarında "Construction Calculator" ve "Tape Calculator" aramalarında en üst sıraya çıkaran kritik anahtar kelimeleri içerir).*

### Category (Kategori)
- **Primary (Birincil)**: `Utilities` (Araçlar)
- **Secondary (İkincil - İsteğe bağlı)**: `Productivity` (Üretkenlik) veya `Business` (İşletme)

### Content Rights (İçerik Hakları)
- **Soru**: *"Does your app contain, display, or access third-party content?"*
- **Seçim**: **No** *(Uygulama tamamen kendi bağımsız kodunu ve hesaplama algoritmalarını kullanır)*.

### Age Ratings (Yaş Derecelendirmesi)
- `Set Up Age Ratings` butonuna tıklayın.
- Açılan anketteki tüm sorulara (Şiddet, Cinsellik, Kumar, Küfür, Web tarayıcısı vb.) **None / No** seçin.
- Sonuç: Otomatik olarak **4+** (Tüm yaşlar için uygun) çıkacaktır.

### App Encryption Documentation (Şifreleme)
- `app.json` içinde `ITSAppUsesNonExemptEncryption: false` olarak tanımlandığı için herhangi bir evrak yüklemenize gerek yoktur.

---

## 2. Version 1.0 (Prepare for Submission Sayfası)

### Promotional Text (Tanıtım Metni) [Maks: 170 karakter]
```text
The ultimate jobsite tape and construction calculator. Solve stairs, roof rafters, and material takeoffs in seconds. Offline and built for tradespeople.
```
*(152 karakter - Yeni bir versiyon göndermeden istediğiniz an güncelleyebileceğiniz vitrin metni).*

### Keywords (Anahtar Kelimeler) [Maks: 100 karakter]
> **Önemli Kural**: Apple virgüllerden sonra boşluk bırakılmasını istemez; her boşluk değerli karakter hakkınızı harcar. Aşağıdaki metni **olduğu gibi kopyalayın** (Tam 100 karakterdir):

```text
construction,calculator,carpentry,framing,stair,rafter,tape,fraction,contractor,drywall,stud,builder
```

### Description (Açıklama) [Maks: 4000 karakter]
```text
BuildTape Pro is the fast, rugged tape measure and construction calculator engineered for framers, carpenters, general contractors, and DIY builders. Stop fighting decimal conversions on the jobsite—calculate in feet, inches, and fractions directly, solve complex stair layouts, roof rafters, and material takeoffs with zero guesswork.

Designed with high-contrast tactile buttons for gloved hands and bright outdoor sunlight, BuildTape Pro is the essential companion you need in your tool pouch.

KEY FEATURES:

FAST TAPE MEASURE & FRACTION CALCULATOR
- Calculate directly in feet, inches, and fractions down to 1/16".
- Continuous running tape calculation with instant history recall.
- Effortlessly add, subtract, multiply, and convert between imperial and metric units.

IBC-COMPLIANT STAIR SOLVER
- Enter total rise to calculate exact riser heights, tread runs, stringer cut lengths, and incline angles.
- Built-in International Building Code (IBC) safety validation prevents code compliance violations before cutting stringers.

ROOF & RAFTER PITCH SOLVER
- Instantly compute common rafter lengths, plumb cuts, level cuts, and pitch math.
- Visual diagram preview shows pitch angles and dimensions in real time.

MATERIAL TAKEOFF & ESTIMATION TOOLS
- Wall Stud Count: Calculate exact studs needed plus corner and intersection waste factors.
- Drywall Sheets: Compute 4x8 and 4x12 sheet counts with waste margin allowances.
- Concrete Volume: Estimate slab, footing, and post hole cubic yards and bag requirements.
- Board Feet: Instant lumber volume calculations for framing stock.

BUILT FOR RUGGED JOBSITES
- 100% Offline: Works in basements, remote construction sites, and off-grid builds without cellular signal.
- Clean OLED Dark Mode: Battery-efficient and ultra-readable under harsh outdoor glare.
- No Subscriptions: Buy once, own forever. Never pay $40/year just to use a calculator on the job.
```

### Support URL (Destek Bağlantısı) [CANLI - AKTİF]
```text
https://p0wz.github.io/buildtape-pro/
```

### Privacy Policy URL (Gizlilik Politikası Bağlantısı) [CANLI - AKTİF]
```text
https://p0wz.github.io/buildtape-pro/#privacy
```

### Copyright (Telif Hakkı)
```text
2026 Süleyman Emir Erdem
```

---

## 3. App Review Information (İnceleme Bilgileri)

### Sign-In Required (Giriş Gerekli mi?)
- Kutucuktaki işareti **KALDIRIN (Unchecked)**. *(Uygulamada şifre veya hesap oluşturma zorunluluğu yoktur).*

### Contact Information (İletişim Bilgileri)
- **First Name**: Süleyman Emir
- **Last Name**: Erdem
- **Phone Number**: +90 5XX XXX XX XX *(Kendi cep numaranız)*
- **Email Address**: *(Apple Developer hesabınıza kayıtlı e-posta adresiniz)*

### Review Notes (İncelemeci İçin Notlar)
```text
1. App Purpose:
BuildTape Pro is an offline professional construction calculator and jobsite estimating tool for carpenters, framers, contractors, and builders. It solves imperial fraction math, stair layouts (IBC compliant), roof rafters, and material takeoffs (studs, drywall, concrete).

2. Test Instructions & Credentials:
- No login or user account is required to test the app.
- Free Tier includes: Full tape measure calculator and calculation history.
- Pro Gated Solvers: Stairs Solver, Rafter Solver, and Material Estimators.
- To test In-App Purchases: Tap "Settings" at the bottom right. Reviewers can test the one-time Lifetime Pro unlock using Apple's Sandbox environment or tap "Restore Purchases".

3. Offline & Privacy:
BuildTape Pro runs completely offline. No user data, analytics, or tracking identifiers are collected or transmitted.
```
