# Property Management App

A full-stack property management application built with Next.js, Prisma, PostgreSQL, and Supabase. This application allows property managers to efficiently manage properties, tenants, payments, expenses, and financial records.

> **Note**: This is the **first version (v1.0)** of the Property Management App, created as a personal project for a friend who needed a simple yet effective way to manage their rental properties. Future improvements and features will be added based on feedback and requirements.

## 🚀 Features

- **Property Management**: Add, edit, view, and manage property details
- **Tenant Management**: Track tenant information, lease agreements, and contact details
- **Payment Tracking**: Record and monitor tenant payments
- **Expense Management**: Track property-related expenses and categorize them
- **Financial Overview**: Monitor financial records and recurring transactions
- **User Authentication**: Secure login system powered by Supabase
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React** - JavaScript library for building user interfaces

### Backend
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **PostgreSQL** - Powerful open-source relational database
- **Supabase** - Backend-as-a-Service for authentication and database

### Deployment
- **Vercel** - Platform for frontend frameworks and static sites

## 📁 Project Structure

```bash
Property-App
├── public/                  # Static files
│   ├── icons/              # App icons
│   └── images/             # Property images
├── src/
│   ├── components/         # Reusable components
│   ├── pages/              # Next.js pages
│   ├── prisma/             # Prisma schema and migrations
│   ├── styles/             # Global styles
│   └── utils/              # Utility functions
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
└── package.json             # NPM dependencies and scripts
```

## Getting Started

To get started with the Property Management App, follow these steps:

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/property-management-app.git
   ```
2. Navigate to the project directory
   ```bash
   cd property-management-app
   ```
3. Install the dependencies
   ```bash
   npm install
   ```
4. Set up the environment variables
   - Create a `.env` file in the root directory
   - Add your Supabase URL and Anon Key
   - Configure your PostgreSQL database URL
5. Run the development server
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:3000`

## Contributing

Contributions are welcome! If you have suggestions or improvements, please submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Abubakar Garibar Mama](https://www.linkedin.com/in/abubakar-garibar-mama-4047bb24b/)