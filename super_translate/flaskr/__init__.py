#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, jsonify, render_template, request
import time
import json
import random
import requests
from ibm_watson import LanguageTranslatorV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson import ApiException



def create_app(test_config=None):
    app = Flask(__name__)
    authenticator = IAMAuthenticator('{apikey}')
    language_translator = LanguageTranslatorV3(
        version='2021-06-08',
        authenticator=authenticator
    )
    language_translator.set_service_url('{apiurl}')
    language_translator.set_disable_ssl_verification(True)

    @app.route("/ibm")
    def us():
        try:
            response = language_translator.list_languages(headers = {'Custom-Header': '{header_value}'}).get_result()
            return jsonify(response)
            # Invoke a method
        except ApiException as ex:
            return "Method failed with status code " + str(ex.code) + ": " + ex.message


    @app.route('/translator', methods=['POST'])
    def translate():
        success = False
        message = ''
        # get the posted data from the JavaScript request
        projectData = request.get_json()
        source = str(projectData['source']).strip()
        target = str(projectData['target']).strip()
        ready = projectData['ready']
        textToTranslate = str(projectData['text']).strip()
        modelid = source + "-" + target

        # stop if the client send unready data which mean problem in the request
        if ready == False:
            return jsonify({'success': False, 'message': 'bad request sent to server', 'translation': {}})


        # IBM limit text to translated 51.200 byts == 12750 chracters
        if len(textToTranslate) < 12750:
            try:
                # send request to IBM API to translate the text
                translation = language_translator.translate(text=textToTranslate,source=source, target=target).get_result()
                success = True
                message = 'translate success'
            except ApiException as ex:
                translation = {}
                success = False
                message = ex.message
        else:
            # if text length bigger than Limit return result with false and do not perform request
            success = False
            message = 'The text Length is To big Max text to be translated is 12750 chracters length'
            translation = {}

        return jsonify({'success':success, 'message':message, 'translation':translation})

    @app.route("/")
    @app.route("/home")
    @app.route("/translate")
    def home():
        languages = []
        arabic = {}
        english ={}
        try:
            languages_response = language_translator.list_languages(headers = {'Custom-Header': '{header_value}'}).get_result()
            languages = languages_response['languages']

            # get the main english and arabic languages
            for lang in languages:
                if lang['language_name'] == 'English':
                    english = lang
                elif lang['language_name'] == 'Arabic':
                    arabic = lang
                elif english and arabic:
                    break
                else:
                    continue
            # Invoke a method
        except ApiException as ex:
            print("Method failed with status code " + str(ex.code) + ": " + ex.message)
        return render_template('index.html', languages=languages, english=english, arabic=arabic)

    return app
