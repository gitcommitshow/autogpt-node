const openai = require('openai');

class Config {
    constructor() {
        this.debug_mode = false;
        this.continuous_mode = false;
        this.continuous_limit = 0;
        this.speak_mode = false;
        this.skip_reprompt = false;
        this.allow_downloads = false;
        this.skip_news = false;

        this.ai_settings_file = process.env.AI_SETTINGS_FILE || "ai_settings.json";
        this.fast_llm_model = process.env.FAST_LLM_MODEL || "gpt-3.5-turbo";
        this.smart_llm_model = process.env.SMART_LLM_MODEL || "gpt-4";
        this.fast_token_limit = parseInt(process.env.FAST_TOKEN_LIMIT) || 4000;
        this.smart_token_limit = parseInt(process.env.SMART_TOKEN_LIMIT) || 8000;
        this.browse_chunk_max_length = parseInt(process.env.BROWSE_CHUNK_MAX_LENGTH) || 3000;
        this.browse_spacy_language_model = process.env.BROWSE_SPACY_LANGUAGE_MODEL || "en_core_web_sm";

        this.openai_api_key = process.env.OPENAI_API_KEY;
        this.temperature = parseFloat(process.env.TEMPERATURE) || 0;
        this.use_azure = process.env.USE_AZURE === "True";
        this.execute_local_commands = process.env.EXECUTE_LOCAL_COMMANDS === "True";
        this.restrict_to_workspace = process.env.RESTRICT_TO_WORKSPACE === "True";

        if (this.use_azure) {
            this.load_azure_config();
            openai.api_type = this.openai_api_type;
            openai.api_base = this.openai_api_base;
            openai.api_version = this.openai_api_version;
        }

        this.elevenlabs_api_key = process.env.ELEVENLABS_API_KEY;
        this.elevenlabs_voice_1_id = process.env.ELEVENLABS_VOICE_1_ID;
        this.elevenlabs_voice_2_id = process.env.ELEVENLABS_VOICE_2_ID;

        this.use_mac_os_tts = false;
        this.use_mac_os_tts = process.env.USE_MAC_OS_TTS;

        this.use_brian_tts = false;
        this.use_brian_tts = process.env.USE_BRIAN_TTS;

        this.github_api_key = process.env.GITHUB_API_KEY;
        this.github_username = process.env.GITHUB_USERNAME;

        this.google_api_key = process.env.GOOGLE_API_KEY;
        this.custom_search_engine_id = process.env.CUSTOM_SEARCH_ENGINE_ID;

        this.pinecone_api_key = process.env.PINECONE_API_KEY;
        this.pinecone_region = process.env.PINECONE_ENV;

        this.weaviate_host = process.env.WEAVIATE_HOST;
        this.weaviate_port = process.env.WEAVIATE_PORT;
        this.weaviate_protocol = process.env.WEAVIATE_PROTOCOL || "http";
        this.weaviate_username = process.env.WEAVIATE_USERNAME || null;
        this.weaviate_password = process.env.WEAVIATE_PASSWORD || null;
        this.weaviate_scopes = process.env.WEAVIATE_SCOPES || null;
        this.weaviate_embedded_path = process.env.WEAVIATE_EMBEDDED_PATH;
        this.weaviate_api_key = process.env.WEAVIATE_API_KEY || null;
        this.use_weaviate_embedded = process.env.USE_WEAVIATE_EMBEDDED === "True";

        // milvus configuration, e.g., localhost:19530.
        this.milvus_addr = process.env.MILVUS_ADDR || "localhost:19530";
        this.milvus_collection = process.env.MILVUS_COLLECTION || "autogpt";

        this.image_provider = process.env.IMAGE_PROVIDER;
        this.image_size = parseInt(process.env.IMAGE_SIZE) || 256;
        this.huggingface_api_token = process.env.HUGGINGFACE_API_TOKEN;
        this.huggingface_image_model = process.env.HUGGINGFACE_IMAGE_MODEL || "CompVis/stable-diffusion-v1-4";
        this.huggingface_audio_to_text_model = process.env.HUGGINGFACE_AUDIO_TO_TEXT_MODEL;
        this.sd_webui_url = process.env.SD_WEBUI_URL || "http://localhost:7860";
        this.sd_webui_auth = process.env.SD_WEBUI_AUTH;

        // Selenium browser settings
        this.selenium_web_browser = process.env.USE_WEB_BROWSER || "chrome";
        this.selenium_headless = process.env.HEADLESS_BROWSER === "True";

        // User agent header to use when making HTTP requests
        // Some websites might just completely deny request with an error code if
        // no user agent was found.
        this.user_agent = process.env.USER_AGENT ||
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36";

        this.redis_host = process.env.REDIS_HOST || "localhost";
        this.redis_port = process.env.REDIS_PORT || "6379";
        this.redis_password = process.env.REDIS_PASSWORD || "";
        this.wipe_redis_on_start = process.env.WIPE_REDIS_ON_START === "True";
        this.memory_index = process.env.MEMORY_INDEX || "auto-gpt";
        // Note that indexes must be created on db 0 in redis, this is not configurable.

        this.memory_backend = process.env.MEMORY_BACKEND || "local";
        // Initialize the OpenAI API client
        openai.api_key = this.openai_api_key;

        this.plugins_dir = process.env.PLUGINS_DIR || "plugins";
        this.plugins = [];
        this.plugins_openai = [];

        const plugins_allowlist = process.env.ALLOWLISTED_PLUGINS;
        if (plugins_allowlist) {
            this.plugins_allowlist = plugins_allowlist.split(",");
            } else {
            this.plugins_allowlist = [];
        }
        this.plugins_denylist = [];
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