#! /bin/bash

systemctl stop clinic.service

cp /home/clinic/jobs/petro-clinic/deploy/clinic.service /etc/systemd/system/clinic.service

systemctl daemon-reload
systemctl enable clinic.service

systemctl start clinic.service
