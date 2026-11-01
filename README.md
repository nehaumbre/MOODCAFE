# 🍵 Mood Café (ムードカフェ)
### Modern, Japanese-Inspired Smart Café Web Application with Google Cloud SQL PostgreSQL & Socket.IO

🌐 **Live Google Cloud Run Production URL**:  
👉 **[https://mood-cafe-115647138214.us-central1.run.app](https://mood-cafe-115647138214.us-central1.run.app)**

📁 **GitHub Repository**:  
👉 **[https://github.com/nehaumbre/MOODCAFE](https://github.com/nehaumbre/MOODCAFE)**

☁️ **Google Cloud Project**: `moodcafe-513406` (Region: `us-central1`)

---

## 🌸 Four Core Features

### 1. Mood Menu (気分メニュー)
- Customers select their current state of mind from five curated Japanese moods:
  - **集中 (Focus / Shūchū)**: Clean-burning caffeine, ceremonial matchas, and nutrient-dense levain toasts for deep cognitive flow.
  - **安らぎ (Comfort / Yasuragi)**: Velvety steamed milk, aromatic chai spices, and warm melted sourdough sandos.
  - **活気 (Energetic / Kakki)**: High-voltage espresso extractions, citrus infusions, and spicy shichimi street-style bites.
  - **清新 (Refresh / Seishin)**: Cold-whisked botanicals, crisp cold-pressed juices, and fresh garden salads.
  - **至福 (Indulgence / Shifuku)**: Fluffy soufflé pancakes, artisanal sea salt mochas, and decadent chocolate bliss.
- Integrated with Third Wave Coffee's authentic menu with sensory notes, calorie counts, and barista customizations (temperature, milk choices, sweetness, and ice levels).

### 2. Table Personality (席の個性)
- Customers select their seating atmosphere based on live table availability:
  - **Focus Zone (集中ブース)**: Silent nooks, dual AC outlets, directional warm reading lights.
  - **Social Zone (和みテーブル)**: Solid Hinoki communal tables overlooking the tranquil rock courtyard.
  - **Window Seat (木漏れ日カウンター)**: Natural sunlight bar counter with street & garden views.
  - **Quick Bite (立ち飲み・急ぎ席)**: Fast standing high-counter right beside the barista station.
- Interactive architectural floor plan with live occupancy color tags (空 Open / 満 Busy / 予 Reserved).

### 3. Smart Order Matching (券売機 - Digital Shōkenki System)
- Inspired by authentic Japanese restaurant ticket vending machines (*shōkenki* 券売機):
  - Dispenses numbered digital tickets (e.g. `№ F-105`, `№ A-101`) with red Japanese Hanko approval stamp seals (済, 調, 呼) and barcodes.
  - Automatically dispatches order items across specialized kitchen preparation stations:
    - **Espresso Bar (珈琲処)**: Double extractions, cold brews, and lattes.
    - **Matcha & Tea Bar (茶房)**: Ceremonial whisked matcha, herbal infusions, and lemonades.
    - **Hot Kitchen (熱厨房)**: Sourdough toasts, shakshuka, pastas, pizzas, and hot bites.
    - **Bakery & Cold Bar (冷製・甘味処)**: Bagels, pancakes, frappes, and fresh salads.
  - Dynamically calculates estimated preparation times based on item complexity and station backlog.

### 4. Virtual Queue & Real-Time Tracking (仮想待合室)
- Live queue position ("You are #2 in line").
- 5-stage visual lifecycle:
  `[Received 受注] ➔ [Preparing 調理中] ➔ [Plating 仕上げ] ➔ [Ready for Pickup お呼出] ➔ [Completed 完了]`
- Web Audio API harmonized Japanese temple bell chime when order is ready for collection.
- Dual perspective toggle: seamlessly switch between **Customer Guest View** and **Staff Kitchen Display System (KDS)** with instant Socket.IO synchronization.

---

## 🗄️ Relational Database Architecture (Google Cloud SQL PostgreSQL)

The backend features 8 normalized relational tables executed within transactional boundaries (`BEGIN ... COMMIT`):

1. **`customers`**: Unique guest records and contact timestamps.
2. **`menu_items`**: Menu catalog with Japanese names, categories, pricing, calories, preparation station, and mood tags.
3. **`cafe_tables`**: Spatial floor plan zones, seat capacity, status (`available`, `occupied`, `reserved`), features, and active ticket assignments.
4. **`orders`**: Master digital shōkenki ticket orders with customer link, mood selection, table linkage, total, lifecycle status, dynamic estimated wait, and payment status.
5. **`order_items`**: Individual food and beverage items with size, quantity, preparation station, and barista modifiers (temperature, milk, sweetness, ice).
6. **`mood_preferences`**: Customer mood tracking and sensory notes linked to orders.
7. **`table_preferences`**: Seating preferences and confirmed table allocations linked to orders.
8. **`queue_entries`**: Real-time virtual queue entries tracking queue positions, estimated wait times, and progress stages.

---

## ☁️ Google Cloud Run Deployment

The service is actively deployed in `us-central1`:
```bash
gcloud run deploy mood-cafe \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```
- **Service URL**: https://mood-cafe-115647138214.us-central1.run.app
- **Health Check Probe**: https://mood-cafe-115647138214.us-central1.run.app/api/health
