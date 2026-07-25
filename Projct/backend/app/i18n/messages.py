"""
Localized message catalog for API error messages.

Supports: en, zh, bn, hi, ar, nl, fr
Fallback: en
"""

MESSAGES = {
    "auth": {
        "invalid_credentials": {
            "en": "Invalid email or password.",
            "zh": "邮箱或密码无效。",
            "bn": "ইমেইল বা পাসওয়ার্ড ভুল।",
            "hi": "ईमेल या पासवर्ड अमान्य।",
            "ar": "البريد الإلكتروني أو كلمة المرور غير صالحة.",
            "nl": "Ongeldige e-mail of wachtwoord.",
            "fr": "Email ou mot de passe invalide.",
        },
        "email_exists": {
            "en": "An account with this email already exists.",
            "zh": "此邮箱已注册。",
            "bn": "এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।",
            "hi": "इस ईमेल से पहले से खाता मौजूद है।",
            "ar": "يوجد حساب بهذا البريد الإلكتروني بالفعل.",
            "nl": "Er bestaat al een account met dit e-mailadres.",
            "fr": "Un compte avec cet email existe déjà.",
        },
        "weak_password": {
            "en": "Password must be at least 8 characters.",
            "zh": "密码至少需要8个字符。",
            "bn": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
            "hi": "पासवर्ड कम से कम 8 अक्षर का होना चाहिए।",
            "ar": "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
            "nl": "Wachtwoord moet minimaal 8 tekens bevatten.",
            "fr": "Le mot de passe doit contenir au moins 8 caractères.",
        },
        "not_authenticated": {
            "en": "Authentication required.",
            "zh": "需要登录。",
            "bn": "লগইন প্রয়োজন।",
            "hi": "लॉगिन आवश्यक है।",
            "ar": "المصادقة مطلوبة.",
            "nl": "Authenticatie vereist.",
            "fr": "Authentification requise.",
        },
        "forbidden": {
            "en": "You do not have permission.",
            "zh": "您没有权限。",
            "bn": "আপনার অনুমতি নেই।",
            "hi": "आपके पास अनुमति नहीं है।",
            "ar": "ليس لديك إذن.",
            "nl": "U heeft geen toestemming.",
            "fr": "Vous n'avez pas la permission.",
        },
    },
    "generic": {
        "not_found": {
            "en": "Resource not found.",
            "zh": "资源未找到。",
            "bn": "রিসোর্স পাওয়া যায়নি।",
            "hi": "संसाधन नहीं मिला।",
            "ar": "المورد غير موجود.",
            "nl": "Bron niet gevonden.",
            "fr": "Ressource introuvable.",
        },
        "server_error": {
            "en": "Internal server error.",
            "zh": "服务器内部错误。",
            "bn": "সার্ভার ত্রুটি।",
            "hi": "सर्वर त्रुटि।",
            "ar": "خطأ داخلي في الخادم.",
            "nl": "Interne serverfout.",
            "fr": "Erreur interne du serveur.",
        },
        "duplicate_application": {
            "en": "You have already applied to this job.",
            "zh": "您已申请过此职位。",
            "bn": "আপনি ইতিমধ্যে এই চাকরিতে আবেদন করেছেন।",
            "hi": "आप पहले ही इस नौकरी के लिए आवेदन कर चुके हैं।",
            "ar": "لقد تقدمت بالفعل لهذه الوظيفة.",
            "nl": "U heeft al gesolliciteerd op deze vacature.",
            "fr": "Vous avez déjà postulé à cette offre.",
        },
        "job_not_active": {
            "en": "This job is not accepting applications.",
            "zh": "此职位不接受申请。",
            "bn": "এই চাকরিটি আবেদন গ্রহণ করছে না।",
            "hi": "यह नौकरी आवेदन स्वीकार नहीं कर रही है।",
            "ar": "هذه الوظيفة لا تقبل الطلبات.",
            "nl": "Deze vacature accepteert geen sollicitaties.",
            "fr": "Cette offre n'accepte plus de candidatures.",
        },
    },
}

FALLBACK_LANG = "en"


def get_message(category: str, key: str, lang: str = "en") -> str:
    """Return a localized message, falling back to English."""
    cat = MESSAGES.get(category, {})
    entry = cat.get(key, {})
    return entry.get(lang) or entry.get(FALLBACK_LANG, key)
