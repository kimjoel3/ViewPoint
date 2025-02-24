from flask import Flask, request, render_template, jsonify
import openai

app = Flask(__name__)

OPENAI_API_KEY = "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"
openai.api_key = OPENAI_API_KEY

inputlist = []
responselist = []

def buffer_helper(array1, array2):
    buffered = ''
    for i in range(len(array1)):
        if i >0: 
            buffered = buffered + "'Me:'" + array1[i] + "'AI:'" + str(array2[i])
    # else:
    #     for i in range(len(array1)):
    #         while i > (len(array1)) - 5:
    #             if i>0: 
    #               buffered = buffered + "'Me'" + array1[i] + "'AI:'" + str(array2[i])
    return buffered


def summary_helper(string1, string2): 
    summary = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "I am giving u a text and a transcript of a the conversation with my chatbot. You need to turn it into one text to send to my chatbot so that the chatbot understands what we are talking about. Make sure it is one or two sentences and restrict it to 200 words maximum. For example if the text is 'what should I do?', you should give me what should I do about ___ (filling in the blank using context from the transcript. Here is the text and the transcript:  Text: 'Tell me more.', Transcript: ''Me:' I've been feeling so empty lately, like nothing brings me joy anymore. 'AI:' Reflecting on our previous conversations, it's clear that you're experiencing emotional emptiness and a lack of joy, which are common signs of depression. Remember, seeking help is important. Reach out to mental health professionals who can assist you in understanding and managing these feelings. Engage in activities that once brought you happiness, even if it's challenging at first"},
        {"role": "assistant", "content": "What should I do about my emotional emptiness and lack of joy?"},
        {"role": "user", "content": " Text: 'Thank you for your help', Transcript: ‘Me:’ Hey ‘AI:’ Hello! I'm here to listen without judgment. How can I support you today? ‘Me:’ Lately, I've been feeling really down 'AI:’ I’m sorry to hear that you've been experiencing low mood. It's important to recognize your feelings. Depression is something many people go through. Have you noticed any changes in appetite, sleep patterns, or interest in activities you used to enjoy? Remember that reaching out for support from friends, family, or a mental health professional can provide insights and guidance. You don't have to go through this alone. ‘Me:’ I appreciate your support. The weight in my chest just doesn't seem to go away. 'AI:’ I'm here for you, and I understand how distressing that feeling can be. The heaviness you're describing could be a manifestation of the emotional weight that depression can bring. Have you considered exploring therapy or counseling? It could provide you with coping strategies and a safe space to process these emotions. Remember, it's okay to ask for help. ‘Me:’ I've been thinking about therapy, but the idea of opening up to someone is scary. 'AI:’ It's completely normal to feel apprehensive about sharing your feelings. Therapy is a collaborative process, and a therapist is there to support you at your own pace. They can provide tools to manage the weight you're feeling and help you navigate through these emotions. Remember, seeking help is a courageous step toward your well-being. ‘Me:’ I guess you're right. It's just hard to admit that I can't handle this on my own. 'AI:’ You're not alone in feeling that way. Asking for help is a sign of strength, not weakness. We all face challenges that require support. Just like we lean on friends during tough times, therapy offers a space to explore your thoughts and emotions in a judgment-free environment. It's a positive step toward self-care and healing."},
        {"role": "assistant", "content": "Thank you for your help with my depression."},
        {"role": "user", "content": "Text:" + string1 + "Transript:" + string2}
    ]
)
    return str(summary['choices'][0]['message']['content'])
    

def chat(user_input, inputlist, responselist):
    
    if len(inputlist) > 1:
        buffer = buffer_helper(inputlist, responselist)
            #print("buffer is", buffer)
        summary = summary_helper(user_input, buffer)
            #print("summary is:", summary)
            #print("buffer:", buffer, "summary:", summary)
    if len(inputlist) > 1: 
            #messages = "role: You are an empathic active listener/AI therapist and must respond to the current text at the end of this prompt using the following context 'Previous Texts:'" + buffer + "'Summary of earlier conversation:'" + summary + "'current Text:'" + user_input + "\n",
        response = openai.Completion.create(
            model= "davinci:ft-horizon-ventures-employees-2023-08-12-02-10-54",
            prompt = summary + "->n\n###\n\n",
            temperature= 0,
            max_tokens = 200,
            stop = "END"
            )
    else: 
        response = openai.Completion.create(
            model= "davinci:ft-horizon-ventures-employees-2023-07-17-09-31-28",
            prompt = user_input + "->",
            temperature= 0,
            max_tokens = 200,
            stop = "END"
            )
    # responselist.append(response['choices'][0]['text'])
    # inputlist.append(user_input)
    return response['choices'][0]['text']

@app.route('/')
def index():
    return render_template('index.html')



@app.route('/get_response', methods = ['POST'])

    

def get_response():
    global inputlist, responselist
    data = request.json
    user_input = data['user_input']
    ai_response = chat(user_input, inputlist, responselist)
    inputlist.append(user_input)
    responselist.append(ai_response)
    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(debug = True, port = 8000)
        