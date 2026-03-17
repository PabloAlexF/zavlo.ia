"""
Extrator de Faixa de Preço
Converte queries de preço em dados estruturados
"""
import re


def extract_price_range(normalized: str) -> dict | None:
    """🔥 Extrai faixa de preço estruturada da query
    
    Returns:
        {
            "min_price": int | None,
            "max_price": int | None,
            "target_price": int | None
        }
    """
    
    def parse_value(value_str: str) -> int:
        """Converte string de preço em número inteiro"""
        value_str = value_str.replace(" ", "").lower()
        
        # "50mil" ou "50k" → 50000
        if "mil" in value_str or "k" in value_str:
            nums = re.findall(r'\d+', value_str)
            if nums:
                return int(nums[0]) * 1000
        
        # "50000" ou "R$ 50000"
        nums = re.findall(r'\d+', value_str)
        if nums:
            return int(nums[0])
        
        return 0
    
    # 1️⃣ ENTRE X E Y
    match = re.search(r'entre\s+(\d+\s*(mil|k)?)(\s*e\s*|\s*a\s*)(\d+\s*(mil|k)?)', normalized)
    if match:
        min_val = parse_value(match.group(1))
        max_val = parse_value(match.group(4))
        return {
            "min_price": min_val,
            "max_price": max_val,
            "target_price": None
        }
    
    # 2️⃣ ATÉ X / ABAIXO DE X / MENOS DE X
    match = re.search(r'(ate|abaixo\s+de|menos\s+de)\s+(\d+\s*(mil|k)?)', normalized)
    if match:
        max_val = parse_value(match.group(2))
        return {
            "min_price": None,
            "max_price": max_val,
            "target_price": None
        }
    
    # 3️⃣ ACIMA DE X / MAIS DE X
    match = re.search(r'(acima\s+de|mais\s+de)\s+(\d+\s*(mil|k)?)', normalized)
    if match:
        min_val = parse_value(match.group(2))
        return {
            "min_price": min_val,
            "max_price": None,
            "target_price": None
        }
    
    # 4️⃣ R$ X ou X REAIS (valor exato)
    match = re.search(r'r\$\s*(\d+)', normalized)
    if match:
        value = int(match.group(1))
        return {
            "min_price": None,
            "max_price": None,
            "target_price": value
        }
    
    match = re.search(r'(\d+)\s*reais', normalized)
    if match:
        value = int(match.group(1))
        return {
            "min_price": None,
            "max_price": None,
            "target_price": value
        }
    
    # 5️⃣ VALOR SOLTO (50mil, 50k)
    match = re.search(r'\b(\d+)\s*(mil|k)\b', normalized)
    if match:
        if not re.search(r'(ate|entre|acima|abaixo|mais|menos)', normalized):
            value = parse_value(match.group(0))
            return {
                "min_price": None,
                "max_price": None,
                "target_price": value
            }
    
    return None
