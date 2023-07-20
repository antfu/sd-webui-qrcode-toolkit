import gradio as gr
from modules import scripts


class Script(scripts.Script):
    def title(self):
        return "Anthony's QR Toolkit"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def after_component(self, component, **kwargs):
        # Add button to both txt2img and img2img tabs
        if kwargs.get("elem_id") == "extras_tab":
            send_button1 = gr.Button(
                "Send to QR Compare", elem_id=f"qrtoolkit_send_button")
            send_button1.click(None, [], None, _js="() => qrtoolkitSendImage()")

            send_button2 = gr.Button(
                "Send to QR Scanner", elem_id=f"qrtoolkit_send_scanner_button")
            send_button2.click(None, [], None, _js="() => qrtoolkitSendScanner()")

    def ui(self, is_img2img):
        return []
