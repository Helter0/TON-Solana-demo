# TON-Solana Smart Wallet

A revolutionary cross-chain smart wallet that enables users to authenticate with TON Wallet and manage Solana accounts without exposing private keys. Users can deposit funds, trade on Jupiter DEX, and withdraw assets using TON signatures for maximum security.

## 🌟 Features

- **🔐 Secure Cross-Chain Authentication**: Use TON Wallet to securely manage Solana accounts
- **⚡ No Private Key Exposure**: Your Solana private keys never leave TON ecosystem
- **🏦 Program Derived Addresses (PDA)**: Smart contracts control your Solana accounts
- **🔄 Jupiter DEX Integration**: Trade tokens with built-in slippage protection
- **📱 Modern UI**: Responsive Next.js interface with TON Connect
- **🛡️ Security First**: Ed25519 signature verification and replay attack protection

## 🏗️ Architecture

### Smart Contract Layer (Solana/Anchor)
- **SmartAccount**: PDA accounts linked to TON public keys
- **Operation Execution**: Transfer, swap, and withdraw with TON signature verification
- **Security Features**: Nonce-based replay protection and timestamp validation

### Backend API (Node.js/TypeScript)
- RESTful API for account management and operation preparation
- Redis caching for performance optimization
- Jupiter V6 integration for DEX functionality
- Rate limiting and comprehensive error handling

### Frontend (Next.js 14)
- Modern React application with App Router
- TON Connect integration for wallet authentication
- Real-time balance updates and transaction history
- Responsive design with Tailwind CSS

### Common Package
- Shared TypeScript types and utilities
- Cross-platform constants and validation helpers
- Signature message formatting and PDA derivation

## 🏗 Архитектура проекта

```
src/
├── app/
│   ├── layout.tsx                 # Root layout с TON Connect провайдером
│   ├── page.tsx                   # Главная страница с демо функционалом
│   └── globals.css                # Tailwind CSS стили
├── components/
│   └── TonConnectProvider.tsx     # TON Connect UI провайдер
└── public/
    └── tonconnect-manifest.json   # Манифест для TON Connect интеграции
```

## 🚀 Запуск проекта

```bash
# Клонирование репозитория
git clone https://github.com/Helter0/TON-Solana-demo.git
cd TON-Solana-demo

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🌐 Live Demo

**URL**: https://ton-solana-demo.vercel.app/

### Как тестировать:
1. Подключите TON кошелек (рекомендуется Tonkeeper)
2. Посмотрите сгенерированный Solana адрес
3. Отправьте небольшое количество SOL на адрес для проверки
4. Используйте кнопку 🔄 для обновления баланса
5. Попробуйте seed phrase верификацию (только с тестовыми кошельками!)

## 📚 Технический стек

### Основные зависимости:
- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - Статическая типизация
- **Tailwind CSS** - Utility-first CSS фреймворк

### Блокчейн интеграции:
- **@tonconnect/ui-react** - TON Connect UI компоненты
- **@tonconnect/sdk** - TON Connect SDK
- **@solana/web3.js** - Solana blockchain интеграция
- **@ton/crypto** - TON криптографические утилиты
- **bip39** - Мнемонические фразы
- **bs58** - Base58 кодирование для Solana адресов

### RPC провайдеры:
- **Helius RPC** (основной) - премиум Solana RPC
- **Fallback RPC** - Ankr, Serum, Official Solana

## 🔧 Конфигурация

### TON Connect Manifest
Обновите URLs в `public/tonconnect-manifest.json` для вашего домена:

```json
{
  "url": "https://your-domain.com",
  "name": "TON-Solana Bridge Demo",
  "iconUrl": "https://your-domain.com/icon.png"
}
```

### RPC Endpoints
Настройте Solana RPC в `src/app/page.tsx`:

```typescript
const rpcEndpoints = [
  'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];
```

## 🔍 Верификация и тестирование

### Методы проверки корректности адреса:

1. **Seed Phrase верификация** (встроена в демо)
   - Введите seed phrase в желтую секцию
   - Сравните результаты с подключенным кошельком

2. **Транзакционный тест**
   - Отправьте 0.001 SOL на сгенерированный адрес
   - Если баланс обновится - адрес корректен

3. **Внешние инструменты**
   - MyTonWallet для получения TON публичного ключа
   - Ручная конвертация Ed25519 → Base58

## ⚠️ Disclaimer и ограничения

### 🚨 Безопасность:
- **НЕ вводите реальные seed phrases** в демо
- **Используйте только тестовые кошельки**
- **Не полагайтесь на это для реальных средств**

### 🔬 Исследовательские выводы:
- **Ed25519 совместимость подтверждена** на криптографическом уровне
- **Derivation paths являются барьером** для прямой совместимости
- **TON Connect публичные ключи корректны** (hex формат, 32 байта)
- **SignData API технически реализуем**, но ограничен derivation paths

### 📋 Практические выводы:
- **Прямая кроссчейн совместимость невозможна** без seed phrase доступа
- **Централизованные решения** более практичны для кроссчейн UX
- **Мостовые решения** остаются основным путем для кроссчейн операций

## 💡 Практические рекомендации

### Для разработчиков кроссчейн решений:
- ✅ **Используйте централизованные подходы** для лучшего UX
- ✅ **Мостовые решения** для реальной кроссчейн функциональности  
- ❌ **Не полагайтесь на прямую совместимость** ключей между сетями
- ❌ **SignData не решает** проблему derivation paths

### Для TON ecosystem:
- 🔬 **Исследуйте возможности** стандартизации derivation paths
- 🛠 **Развивайте инфраструктуру** для кроссчейн интеграций
- 📚 **Документируйте ограничения** TON Connect для разработчиков

## 🔮 Потенциальные направления

### Теоретически возможно:
- [ ] Кроссчейн подписи через seed phrase (небезопасно)
- [ ] Стандартизация derivation paths между сетями
- [ ] Прокси-подписи через доверенные сервисы
- [ ] ZK-proof для кроссчейн авторизации

### Практически реализуемо:
- [x] **Централизованные кроссчейн платформы**
- [x] **Мостовые решения** с отдельными кошельками  
- [x] **LayerZero-подобные** протоколы межсетевого взаимодействия

## 📄 Лицензия

MIT License - смотрите файл LICENSE для деталей.

## 🤝 Вклад в проект

Приветствуются PR для:
- Улучшения алгоритмов генерации ключей
- Добавления тестов и валидации  
- Исправления багов и уязвимостей
- Документации и примеров

## 📞 Контакты

Создан как часть исследования кросс-чейн совместимости Ed25519 блокчейнов.

---

## 🎯 Заключение исследования

Этот проект успешно **доказал и опроверг** ключевые гипотезы о кроссчейн совместимости:

### ✅ Подтверждено:
- **Ed25519 криптография** действительно совместима между TON и Solana
- **TON Connect корректно предоставляет** публичные ключи (hex, 32 байта)
- **Техническая основа для кроссчейн решений** существует

### ❌ Опровергнуто:
- **Прямая совместимость ключей** невозможна из-за derivation paths
- **SignData API не решает** проблему кроссчейн транзакций
- **"Один кошелек для всех сетей"** требует архитектурных изменений

### 🎭 Практический результат:
**Централизованные подходы** оказались **правильным решением** для кроссчейн UX, а не техническим компромиссом.

**🔬 Исследование завершено. Выводы применимы для принятия архитектурных решений в кроссчейн проектах.**