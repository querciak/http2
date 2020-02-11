from hyper import HTTPConnection
import json
import requests
import urllib3
'''
tutorial http/2
https://hyper.readthedocs.io/en/latest/index.html
'''
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
url = 'https://ec2-52-15-50-82.us-east-2.compute.amazonaws.com/regional/maps?location=12,123'
urllocal = 'https://localhost/regional/maps?location=12,123'
location_path = '/regional/maps?location=12,123'

path_trace = "sample_data/trace/metadata.json"

# open metadata (json) and save it in data
with open(path_trace) as json_file:
    data = json.load(json_file)

    # ask user to choose his location (as a number)
    print("You are between [" + data['start'] + "]\nand [" + data['end'] + "]\nSelect your location(a number from 0 to "
          + str(len(data['route']) - 1) + "): ")
    # ask user's location
    '''
    while True:
        user_choice = int(input())
        if 0 <= user_choice <= (len(data['route']) - 1):
            break

    # set and print user's location
    user_location = data['route'][user_choice]
    '''
    user_location = data['route'][5]
    print(user_location)

# open connection with server
'''connection = HTTPConnection(url)'''

# GET request
'''connection.request('GET', location_path)'''
verif = '/Users/quercia/internet-protocols-gC/server/server/server.crt'
headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'}
r = requests.get(urllocal,headers=headers, verify=False)

print(r)
# save response in response
'''response = connection.get_response()'''
# save and print response body
'''response_json = json.loads(response.read())
print(response_json)'''
