const openai = require('openai');

class Config {
    constructor() {
        this.debugMode = false;
        this.continuousMode = false;
        this.continuousLimit = 3;
        this.speakMode = false;
        this.skipReprompt = false;
        this.allowDownloads = false;
        this.skipNews = false;

        this.aiSettingsFile = process.env.AI_SETTINGS_FILE || "./ai_settings.json";
        this.promptSettingsFile = process.env.PROMPT_SETTINGS_FILE || "./prompt_settings.json";
        this.fastLlmModel = process.env.FAST_LLM_MODEL || "gpt-3.5-turbo";
        this.smartLlmModel = process.env.SMART_LLM_MODEL || "gpt-4";
        this.fastTokenLimit = parseInt(process.env.FAST_TOKEN_LIMIT) || 4000;
        this.smartTokenLimit = parseInt(process.env.SMART_TOKEN_LIMIT) || 8000;
        this.browseChunkMaxLength = parseInt(process.env.BROWSE_CHUNK_MAX_LENGTH) || 3000;
        this.browseSpacyLanguageModel = process.env.BROWSE_SPACY_LANGUAGE_MODEL || "en_core_web_sm";

        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.temperature = parseFloat(process.env.TEMPERATURE) || 0;
        this.useAzure = process.env.USE_AZURE === "True";
        this.executeLocalCommands = process.env.EXECUTE_LOCAL_COMMANDS === "True";
        this.restrictToWorkspace = process.env.RESTRICT_TO_WORKSPACE === "True";

        if (this.useAzure) {
            this.loadAzureConfig();
            openai.apiType = this.openaiApiType;
            openai.apiBase = this.openaiApiBase;
            openai.apiVersion = this.openaiApiVersion;
        }
        
        this.elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
        this.elevenlabsVoice1Id = process.env.ELEVENLABS_VOICE_1_ID;
        this.elevenlabsVoice2Id = process.env.ELEVENLABS_VOICE_2_ID;
        
        this.useMacOsTts = false;
        this.useMacOsTts = process.env.USE_MAC_OS_TTS;
        
        this.useBrianTts = false;
        this.useBrianTts = process.env.USE_BRIAN_TTS;
        
        this.githubApiKey = process.env.GITHUB_API_KEY;
        this.githubUsername = process.env.GITHUB_USERNAME;
        
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.customSearchEngineId = process.env.CUSTOM_SEARCH_ENGINE_ID;
        
        this.pineconeApiKey = process.env.PINECONE_API_KEY;
        this.pineconeRegion = process.env.PINECONE_ENV;
        
        this.weaviateHost = process.env.WEAVIATE_HOST;
        this.weaviatePort = process.env.WEAVIATE_PORT;
        this.weaviateProtocol = process.env.WEAVIATE_PROTOCOL || "http";
        this.weaviateUsername = process.env.WEAVIATE_USERNAME || null;
        this.weaviatePassword = process.env.WEAVIATE_PASSWORD || null;
        this.weaviateScopes = process.env.WEAVIATE_SCOPES || null;
        this.weaviateEmbeddedPath = process.env.WEAVIATE_EMBEDDED_PATH;
        this.weaviateApiKey = process.env.WEAVIATE_API_KEY || null;
        this.useWeaviateEmbedded = process.env.USE_WEAVIATE_EMBEDDED === "True";
        
        // milvus configuration, e.g., localhost:19530.
        this.milvusAddr = process.env.MILVUS_ADDR || "localhost:19530";
        this.milvusCollection = process.env.MILVUS_COLLECTION || "autogpt";
        
        this.imageProvider = process.env.IMAGE_PROVIDER;
        this.imageSize = parseInt(process.env.IMAGE_SIZE) || 256;
        this.huggingfaceApiToken = process.env.HUGGINGFACE_API_TOKEN;
        this.huggingfaceImageModel = process.env.HUGGINGFACE_IMAGE_MODEL || "CompVis/stable-diffusion-v1-4";
        this.huggingfaceAudioToTextModel = process.env.HUGGINGFACE_AUDIO_TO_TEXT_MODEL;
        this.sdWebuiUrl = process.env.SD_WEBUI_URL || "http://localhost:7860";
        this.sdWebuiAuth = process.env.SD_WEBUI_AUTH;
        
        // Selenium browser settings
        this.seleniumWebBrowser = process.env.USE_WEB_BROWSER || "chrome";
        this.seleniumHeadless = process.env.HEADLESS_BROWSER === "True";
        
        // User agent header to use when making HTTP requests
        // Some websites might just completely deny request with an error code if
        // no user agent was found.
        this.userAgent = process.env.USER_AGENT ||
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36";
        
        this.redisHost = process.env.REDIS_HOST || "localhost";
        this.redisPort = process.env.REDIS_PORT || "6379";
        this.redisPassword = process.env.REDIS_PASSWORD || "";
        this.wipeRedisOnStart = process.env.WIPE_REDIS_ON_START === "True";
        this.memoryIndex = process.env.MEMORY_INDEX || "auto-gpt";            
    }

    check_openai_api_key() {
        const openai_api_key = process.env.OPENAI_API_KEY;
        if (!openai_api_key) {
            console.log("\x1b[31m%s\x1b[0m", "Please set your OpenAI API key in .env or as an environment variable.");
            console.log("You can get your key from https://platform.openai.com/account/api-keys");
            process.exit(1);
        }
    }
    
}

module.exports = Config;