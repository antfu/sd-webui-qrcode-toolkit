from modules import script_callbacks, scripts, shared
import gradio as gr
import string

# url = 'http://localhost:3000'
url = 'https://qrcode.antfu.me' 

def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        canvas = gr.HTML(f"<iframe id=\"qrtoolkit-iframe\" class=\"border-2 border-gray-200\" src=\"{url}\" onload=\"()=>qrtoolkitInit()\"></iframe>")
    return [(ui, "QR Toolkit", "QR Toolkit")]

script_callbacks.on_ui_tabs(add_tab)
