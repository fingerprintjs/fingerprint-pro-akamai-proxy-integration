# Akamai property example

Make sure you have `terraform` installed. Find more about it [here](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli). Run your terminal as "rosetta" if you are on M1 machine.

- Clone the repository
- Check `terraform.tfvars` file and replace values with your own. `domain` is the Akamai property domain. `origin` is your content's domain, you may use "origin-akamai.cfi-fingerprint.com" if you like. `contact_email` may be your work email.
- Run `terraform init`
- Run `terraform plan`
- Run `terraform apply`. Enter 'yes' as the value. This will take around 10 mins to complete. The property creation is fast, but activation takes long.
    ```bash
    Plan: 1 to add, 1 to change, 0 to destroy.
    
    Do you want to perform these actions?
      Terraform will perform the actions described above.
      Only 'yes' will be accepted to approve.
    
      Enter a value: yes
    
    akamai_property.property: Modifying... [id=prp_985545]
    akamai_property.property: Modifications complete after 8s [id=prp_985545]
    akamai_property_activation.activation: Creating...
    akamai_property_activation.activation: Still creating... [10s elapsed]
    akamai_property_activation.activation: Still creating... [20s elapsed]
    akamai_property_activation.activation: Still creating... [30s elapsed]
    akamai_property_activation.activation: Still creating... [40s elapsed] 
    akamai_property_activation.activation: Still creating... [11m50s elapsed]
    ...
    akamai_property_activation.activation: Still creating... [12m0s elapsed]
    akamai_property_activation.activation: Creation complete after 12m5s [id=prp_985545:PRODUCTION]
    
    Apply complete! Resources: 1 added, 1 changed, 0 destroyed.
    ```
- Create a CNAME record for your domain that points to `${your-domain}.edgesuite.net`

After CNAME record is published and your property is activated, your domain should work.

## Enable HTTPS

Note that you don't have to enable HTTPS to use the property. 

Log in to Akamai Control Panel, and click **Certificates** on the left menu. Click **Create New Certificate** to create a new DV certificate and follow instructions.
