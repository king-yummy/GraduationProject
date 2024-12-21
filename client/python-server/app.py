import sys
import os
sys.stdin.reconfigure(encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
os.environ["PYTHONIOENCODING"] = "utf-8"

from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS



# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # CORS 허용

# OpenAI API 키 설정
client = OpenAI(api_key="key")

# 파인튜닝된 모델 이름
fine_tuned_model = "ft:gpt-4o-mini-2024-07-18:personal:sanggon-final:AZfKqVN2"

# 모델 호출 함수
def call_fine_tuned_chat_model(analysis_data, user_message, max_tokens=1024, temperature=0.3, top_p=0.4, frequency_penalty=0, presence_penalty=0):
    try:
        # Analysis 데이터를 메시지로 변환
        if not analysis_data:
            analysis_summary = "현재 분석 데이터가 제공되지 않았습니다."
        else:
            analysis_summary = "\n".join(
                f"- {key}: "
                + " ".join(value.get("countMessages", []))
                + " "
                + " ".join(value.get("trendMessages", []))
                for key, value in analysis_data.items()
            )

        # 시스템 메시지 구성
        system_message = {
            "role": "system",
            "content": (
                "당신은 서울시 상권분석 AI 비서입니다. "
                "다음은 현재 제공된 분석 데이터 요약입니다:\n" + analysis_summary
            ),
        }

        # 사용자 메시지 구성
        user_message_obj = {"role": "user", "content": user_message}

        # GPT 호출
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message["content"]},
                {"role": "user", "content": user_message_obj["content"]}
            ],
            model=fine_tuned_model,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
        )
        message_content = response.choices[0].message.content
        return message_content.strip()
    except UnicodeEncodeError as e:
        print(f"Encoding Error: {e}")
        print("System Message:", system_message)
        print("User Message:", user_message_obj)
        return "인코딩 오류가 발생했습니다. 한글 처리를 확인해주세요."
    except Exception as e:
        print(f"Error calling the chat model: {e}")
        return "GPT 호출 중 오류가 발생했습니다. 다시 시도해주세요."


# Flask 라우트: POST /chat
@app.route("/chat", methods=["POST"])
def chat():
    # 클라이언트 요청 데이터 가져오기
    data = request.get_json()
    user_message = data.get("message", "")
    analysis_data = data.get("analysisData", {})

    # 디버깅: 데이터 확인
    print("Received user message:", user_message)
    print("Received analysis data:", analysis_data)

    if not user_message:
        return jsonify({"reply": "사용자 메시지를 입력해주세요."}), 400

    try:
        # GPT 호출
        gpt_response = call_fine_tuned_chat_model(
            analysis_data=analysis_data,
            user_message=user_message,
        )
        print("GPT Response:", gpt_response)  # GPT 응답 확인
        return jsonify({"reply": gpt_response})
    except Exception as e:
        print(f"Error in /chat route: {e}")
        return jsonify({"reply": "서버에서 오류가 발생했습니다. 다시 시도해주세요."}), 500


# Flask 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
