FROM node:8.11.4-onbuild

RUN npm i -g truffle
RUN cd coincow-contracts && truffle compile

ENTRYPOINT node