<p align="center">
	<img src="https://github.com/sgx4u/sgx4u-ui/blob/production/logo.svg?raw=true" width="75px" align="center" alt="SGX4U" />
	<h2 align="center">🌟 @sgx4u/ui 🌟</h2>
	<p align="center">Accessible, efficient and customizable components to start your own project. Use this to build any project of any scale.</p>
</p>

<br/>

<p align="center">
	<!-- NPM Version -->
	<img src="https://img.shields.io/npm/v/%40sgx4u%2Fui?style=for-the-badge&labelColor=353535&color=3b82f6" alt="Version">
	<!-- License -->
	<img src="https://img.shields.io/github/license/sgx4u/sgx4u-ui?style=for-the-badge&labelColor=353535&color=4f46e5" alt="License">
	<!-- TypeScript -->
	<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
	<!-- JavaScript -->
	<img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript">
	<!-- LinkedIn -->
	<a href="https://www.linkedin.com/in/sgx4u" rel="nofollow"><img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fsgx4u%2F&style=for-the-badge&logo=linkedin&label=SGX4U&labelColor=%230077B5&color=%23353535" alt="LinkedIn"></a>
	<!-- X (Twitter) -->
	<a href="https://x.com/sgx4u" rel="nofollow"><img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Fsgx4u&style=for-the-badge&logo=x&label=sgx4u&labelColor=353535" alt="X (Twitter)"></a>
	<!-- Last Update -->
	<img src="https://img.shields.io/npm/last-update/%40sgx4u%2Fui?style=for-the-badge&labelColor=353535&color=f15b2a" alt="Update">
</p>

<br/>

## ⚜️ Table of Contents

- [Overview](#overview)
- [Links](#️-links)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Usage](#-cli-usage)
- [Theming and Customization](#theming-and-customization)
- [Contributing](#contributing)
- [Versioning and Changelog](#versioning-and-changelog)

<br/>

## 💎 Overview

`@sgx4u/ui` is a transparent, TypeScript-first React component library, designed to be fully readable, extendable, and production-ready. The main goal with this UI library is raw code accessibility, so that there is nothing hidden from the developer.

`@sgx4u/ui` focuses on:

- **No hidden abstractions**: You install real source code, not a black-box design system.
- **Scalability**: Suitable for small prototypes and large-scale applications alike.
- **Consistency**: Opinionated defaults that still stay easy to customize.
- **Developer experience**: A CLI that lets you add and inspect components quickly.

<br/>

## 🔗 Links

- [`SGX4U UI Docs`](ui.sgx4u.com) &dash; Package documentation and component examples.

<br/>

## Features

- **Accessible by default**: Components are built with proper semantics, ARIA attributes, accessibility, and keyboard interactions in mind.
- **TypeScript-first**: Fully typed APIs with explicit, predictable props for each component.
- **Tailwind CSS-based**: Utility classes by default, with clear escape hatches for customization.
- **CLI-driven**: Use the `sgx4u-ui` CLI to initialize projects, inspect components, and add new building blocks.
- **Animation-ready**: Subtle, CSS-only animations are included to keep interfaces feeling smooth and responsive.
- **Composable primitives**: Focus on primitives like `button`, `dialog`, `tabs`, and `text` that compose into more advanced UIs.

<br/>

## Requirements

- **Node.js**: `>= 22.0.0`.
- **Package manager**: `pnpm` is recommended for the best experience.
- **Library & Framework**: React.js 19+, Next.js 16+.
- **Styling**: Tailwind CSS 4+ configured in your project.

## 💡Installation

```sh
npm install @sgx4u/ui       # npm
yarn add @sgx4u/ui          # yarn
pnpm add @sgx4u/ui          # pnpm
```

<br/>

## Quick Start

1. **Initialize SGX4U UI in your project**.

    ```sh
    pnpm dlx @sgx4u/ui@latest init
    ```

2. **Add components in your project**.

    ```sh
    pnpm dlx @sgx4u/ui@latest add button
    ```

3. **Start your dev server** (for example, with Next.js or Vite) and verify the component renders and behaves as expected.

<br/>

## 🚀 CLI Commands

```sh
# Initialize SGX4U UI in your project
pnpm dlx @sgx4u/ui@latest init

# Install a component
pnpm dlx @sgx4u/ui@latest add <component-name>

# Show available components
pnpm dlx @sgx4u/ui@latest list

# Show information about a component
pnpm dlx @sgx4u/ui@latest info

# Show configuration
pnpm dlx @sgx4u/ui@latest config

# Show this help information
pnpm dlx @sgx4u/ui@latest help
```

<br/>

## Theming and Customization

`@sgx4u/ui` is designed to be themed and adapted to your design system.

- **Tailwind tokens**: Extend your Tailwind configuration to align colors, spacing, and typography with your brand.
- **Component overrides**: Because the source is fully accessible, you can copy and adapt components to your own conventions.
- **Utility-first styling**: Use Tailwind utility classes to quickly adjust layout, spacing, and appearance without sacrificing consistency.

For detailed theming guidance, see the docs in `ui.sgx4u.com/docs/styling`.

<br/>

## Versioning and Changelog

This project follows Semantic Versioning.
All notable changes are documented in [`CHANGELOG.md`](./CHANGELOG.md).
