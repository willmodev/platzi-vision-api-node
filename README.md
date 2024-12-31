# PlatziVision Chat API - Nodejs (Express)

API de chat que utiliza el modelo GPT-4 de OpenAI para proporcionar respuestas inteligentes a través de un asistente llamado PlatziVision.

## Características

- Integración con la API de OpenAI
- Streaming de respuestas en tiempo real
- Manejo de errores
- Configuración mediante variables de entorno

## Requisitos

- Node.js
- Una clave de API de OpenAI

## Configuración

1. Clona el repositorio
2. Crea un archivo `.env` basado en `.env.example`
3. Configura las siguientes variables de entorno:
   - `PORT`: Puerto donde correrá el servidor (ej: 3001)
   - `OPENAI_API_KEY`: Tu clave de API de OpenAI

## Instalación
1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor:
   ```bash
   npm start
   ```

El servidor estará disponible en `http://localhost:PORT`, donde PORT es el valor configurado en tu archivo `.env`.


## Proyecto Original

Este proyecto es una adaptación del [PlatziVision original](https://github.com/platzi/platzivision), que consiste en:

- Frontend desarrollado en Next.js
- Backend implementado en Python

Esta versión mantiene la misma funcionalidad del `backend` pero está reimplementada con: **Node.js y Express**



