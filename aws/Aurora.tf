AWSTemplateFormatVersion: '2010-09-09'
Description: 'Aurora Cluster Template with Best Practices'

Parameters:
  EnvironmentName:
    Type: String
    Default: 'production'
    AllowedValues: ['development', 'staging', 'production']
    Description: 'Environment name for the Aurora cluster'
    
  DBInstanceClass:
    Type: String
    Default: 'db.r6g.large'
    AllowedValues: ['db.r6g.large', 'db.r6g.xlarge', 'db.r6g.2xlarge']
    Description: 'Database instance class'

  EngineVersion:
    Type: String
    Default: '5.7.mysql_aurora.2.11.2'
    Description: 'Aurora engine version'

Resources:
  AuroraCluster:
    Type: AWS::RDS::DBCluster
    Properties:
      Engine: 'aurora-mysql'
      EngineVersion: !Ref EngineVersion
      DatabaseName: !Sub '${EnvironmentName}db'
      BackupRetentionPeriod: 7
      PreferredBackupWindow: '00:00-01:00'
      PreferredMaintenanceWindow: 'sun:01:00-sun:02:00'
      DeletionProtection: true
      EnableHttpEndpoint: true
      CopyTagsToSnapshot: true
      StorageEncrypted: true
      # スナップショットからの復元の場合
      SnapshotIdentifier: !If 
        - UseSnapshot
        - !Sub 'arn:aws:rds:${AWS::Region}:${AWS::AccountId}:cluster-snapshot:${SnapshotName}'
        - !Ref 'AWS::NoValue'
      Tags:
        - Key: Environment
          Value: !Ref EnvironmentName
      
  AuroraPrimaryInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBClusterIdentifier: !Ref AuroraCluster
      DBInstanceClass: !Ref DBInstanceClass
      Engine: 'aurora-mysql'
      EnablePerformanceInsights: true
      PerformanceInsightsRetentionPeriod: 7
      MonitoringInterval: 60
      EnableCloudwatchLogsExports:
        - error
        - general
        - slowquery
      AutoMinorVersionUpgrade: true
      Tags:
        - Key: Environment
          Value: !Ref EnvironmentName

  AuroraReplicaInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBClusterIdentifier: !Ref AuroraCluster
      DBInstanceClass: !Ref DBInstanceClass
      Engine: 'aurora-mysql'
      EnablePerformanceInsights: true
      PerformanceInsightsRetentionPeriod: 7
      MonitoringInterval: 60
      EnableCloudwatchLogsExports:
        - error
        - general
        - slowquery
      AutoMinorVersionUpgrade: true
      Tags:
        - Key: Environment
          Value: !Ref EnvironmentName

  AuroraSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: 'Security group for Aurora cluster'
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3306
          ToPort: 3306
          SourceSecurityGroupId: !Ref ApplicationSecurityGroup

Outputs:
  ClusterEndpoint:
    Description: 'Cluster endpoint'
    Value: !GetAtt AuroraCluster.Endpoint.Address

  ReaderEndpoint:
    Description: 'Reader endpoint'
    Value: !GetAtt AuroraCluster.ReadEndpoint.Address