# 🌸 Petalia — Online Floral E-Commerce Platform

[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.js.org/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Minimal_API-512bd4.svg?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![SQLite](https://img.shields.io/badge/SQLite-florarie.db-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A full-stack web application for an online flower boutique featuring categorized catalogs, custom bouquet builders, a customer loyalty rewards program, and a role-based admin management dashboard.

---

## 📖 Overview

**Petalia** was designed to overcome the limitations of traditional flower shop management (manual stock tracking, phone orders, absence of a centralized catalog, lack of customer retention systems). 

The platform offers an end-to-end e-commerce experience: customers can explore categories, configure personalized floral arrangements, track order statuses, and earn/spend loyalty points, while administrators retain full control over product inventories and user permissions.

---

## 📸 User Interface Preview

### 🔐 1. Authentication & Onboarding
| Landing Page | Login | Forgot Password |
| :---: | :---: | :---: |
| ![Landing Page](docs/ui/01-landing-page.png) | ![Login](docs/ui/02-login.png) | ![Forgot Password](docs/ui/03-forgot-password.png) |

| Register / Sign In | User Profile & Sidebar |
| :---: | :---: |
| ![Register](docs/ui/04-register.png) | ![User Profile](docs/ui/10-user-profile.png) |

---

### 🛍️ 2. Catalog & Custom Florals
| Main Categories | Flowers Category | Bouquets Category |
| :---: | :---: | :---: |
| ![Categories](docs/ui/05-home-categories.png) | ![Flowers](docs/ui/06-catalog-flowers.png) | ![Bouquets](docs/ui/08-catalog-bouquets.png) |

| Product Selection & Options | Custom Bouquet Builder | Favorites / Wishlist |
| :---: | :---: | :---: |
| ![Product Options](docs/ui/07-product-modal.png) | ![Create Bouquet](docs/ui/13-create-bouquet.png) | ![Favorites](docs/ui/11-favorite.png) |

---

### 💳 3. Cart, Checkout & Loyalty Program
| Cart Overview | Card Payment (Front) | Card Payment (CVV) |
| :---: | :---: | :---: |
| ![Cart](docs/ui/15-cart.png) | ![Card Front](docs/ui/16-checkout-card-front.png) | ![Card Back](docs/ui/17-checkout-card-back.png) |

| Loyalty Points Balance | Redeem Points for Orders | Order History |
| :---: | :---: | :---: |
| ![Loyalty Overview](docs/ui/12-loyalty-points-overview.png) | ![Loyalty Redeem](docs/ui/14-loyalty-points-redeem.png) | ![Order History](docs/ui/18-order-history.png) |

---

### 🛡️ 4. Administrative Control Panel
| Inventory & Stock Management | User Roles Management | Order Status & Processing |
| :---: | :---: | :---: |
| ![Admin Inventory](docs/ui/19-admin-inventory.png) | ![Admin Users](docs/ui/20-admin-users.png) | ![Admin Orders](docs/ui/21-admin-orders.png) |

---

## ✨ Key Features

### 👤 Customer Features
- **Authentication & User Profile:** Account registration, login, profile editing, and password recovery via SMTP email.
- **Categorized Catalog:** Filtered browsing across 4 collections: *Flowers*, *Bouquets*, *Floral Arrangements*, and *Potted Plants*.
- **Custom Arrangement Builder:** Step-by-step interactive builder to create personalized bouquets and floral arrangements.
- **Shopping Cart & Checkout:** In-memory cart with live quantity adjustment, checkout validation, and automated stock decrements upon purchase.
- **Loyalty Points System:** Earn loyalty points on every standard order (`Points = floor(Total / 20)`). Redeemable on future orders at 1 Point = 1 RON.
- **Wishlist / Favorites:** Quick bookmarking of favorite floral products.
- **Order History:** Complete audit trail of past orders with individual item breakdown and delivery tracking.

### 🛡️ Administrator Features
- **Inventory & Stock Management:** Full CRUD operations on products and categories (name, description, price, stock, image upload).
- **Order Management:** View all placed orders with user and shipping details; update order statuses (`In procesare`, `Confirmata`, `In livrare`, `Finalizata`, `Anulata`).
- **User Role Management:** List registered users and promote/revoke `Administrator` privileges.

---

## 🏗️ System Architecture & Design

Petalia follows a **3-tier Client-Server architecture**:
- **Presentation Layer:** React.js Single Page Application (Port: `localhost:3000`).
- **Application & Business Logic Layer:** ASP.NET Core Minimal API with RESTful endpoints (Port: `localhost:5000`).
- **Data Access & Persistence Layer:** SQLite database (`florarie.db`) managed via `Microsoft.Data.Sqlite` using raw SQL queries and atomic transactions.

<p align="center">
  <img src="docs/diagrams/architecture-diagram.png" alt="Architecture Diagram" width="85%" />
</p>

---

### 📐 Diagrams & System Models

<details>
  <summary><b>🔍 Click to view UML Class Diagram</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/class-diagram.png" alt="UML Class Diagram" width="85%" />
  </p>
</details>

<details>
  <summary><b>🔍 Click to view Use-Case Diagram</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/usecase-diagram.png" alt="Use-Case Diagram" width="85%" />
  </p>
</details>

<details>
  <summary><b>🔍 Click to view Database Schema (ERD)</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/database-diagram.png" alt="Database Diagram" width="85%" />
  </p>
</details>

<details>
  <summary><b>🔍 Click to view Order Placement Sequence Diagram</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/sequence-diagram.png" alt="Sequence Diagram" width="85%" />
  </p>
</details>

<details>
  <summary><b>🔍 Click to view User Navigation Flowchart</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/user-flow.png" alt="User Flow" width="85%" />
  </p>
</details>

<details>
  <summary><b>🔍 Click to view Project Structure Tree</b></summary>
  <br>
  <p align="center">
    <img src="docs/diagrams/project-structure.png" alt="Project Structure" width="70%" />
  </p>
</details>

---

## 📁 Repository Structure

<p align="center">
  <img src="docs/diagrams/project-structure.png" alt="Project File Structure" width="70%" />
</p>

---

## 🛠️ Tech Stack

- **Frontend:**
  - React.js 19 (SPA)
  - React Router DOM 7
  - Lucide React (Icons)
  - Custom CSS
- **Backend:**
  - ASP.NET Core Minimal API (C# / .NET 8–9)
  - Raw SQL queries via `Microsoft.Data.Sqlite`
  - Transaction-based state consistency & automated migrations
- **Database:**
  - SQLite (`florarie.db`)
- **Session Management:**
  - `localStorage` browser session handling

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm
- .NET 8.0 or 9.0 SDK

### 1. Run the Backend (ASP.NET Core)
```bash
cd PetaliaBackend
dotnet restore
dotnet run